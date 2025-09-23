# -*- coding: utf-8 -*-
from flask import Flask, render_template, request, jsonify
import math
import os
import requests
import uuid
import json
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

@app.route('/', methods=['GET', 'POST'])
def index():
    result = None
    if request.method == 'POST':
        try:
            total_amount = float(request.form['totalAmount'])
            people_count = int(request.form['peopleCount'])

            if total_amount > 0 and people_count > 0:
                amount_per_person = total_amount / people_count
                final_amount = math.ceil(amount_per_person)
                result = {
                    'total_amount': f'{total_amount:,.0f}',
                    'people_count': people_count,
                    'final_amount': f'{final_amount:,.0f}'
                }
            else:
                # Handle non-positive numbers if needed, maybe with an error message
                pass # Or set an error message in result

        except (ValueError, KeyError):
            # Handle cases where input is not a valid number or form fields are missing
            pass # Or set an error message

    return render_template('index.html', result=result)

@app.route('/analyze-receipt', methods=['POST'])
def analyze_receipt():
    if 'receipt' not in request.files:
        return jsonify({'error': 'No receipt file found'}), 400

    file = request.files['receipt']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    api_url = os.getenv('CLOVA_OCR_API_URL')
    secret_key = os.getenv('CLOVA_OCR_SECRET_KEY')

    if not api_url or not secret_key:
        return jsonify({'error': 'API credentials not configured'}), 500

    request_json = {
        'images': [
            {
                'format': 'jpeg',
                'name': 'demo'
            }
        ],
        'requestId': str(uuid.uuid4()),
        'version': 'V2',
        'timestamp': 0
    }

    payload = {'message': json.dumps(request_json).encode('UTF-8')}
    files = [('file', file.read())]
    headers = {'X-OCR-SECRET': secret_key}

    try:
        response = requests.post(api_url, headers=headers, data=payload, files=files)
        response.raise_for_status() # Raise an exception for bad status codes
        result = response.json()


        # 일반 OCR 결과를 파싱하기 위한 로직
        total_price = 0
        items = []
        import re

        all_text = ""
        fields = result.get('images', [{}])[0].get('fields', [])
        for field in fields:
            all_text += field.get('inferText', '') + ('\n' if field.get('lineBreak') else ' ')

        lines = all_text.split('\n')
        
        # 1. 총액 찾기 (키워드 기반)
        total_keywords = ['합계', '총액', '받을금액']
        for line in reversed(lines): # 보통 총액은 아래쪽에 있으므로 역순으로 탐색
            for keyword in total_keywords:
                if keyword in line:
                    # 라인에서 숫자만 추출
                    numbers = re.findall(r'[\d,]+', line)
                    if numbers:
                        try:
                            price_text = numbers[-1].replace(',', '') # 가장 마지막 숫자를 총액으로 간주
                            total_price = float(price_text)
                            break
                        except ValueError:
                            continue
            if total_price > 0:
                break

        # 2. 메뉴 항목 찾기 (패턴 기반)
        # 한글/영어 메뉴 이름과 숫자로 된 가격이 함께 있는 라인을 찾음
        for line in lines:
            # 메뉴 이름으로 추정되는 부분 (숫자로 시작하지 않는 문자열)
            name_match = re.search(r'^[가-힣a-zA-Z\s]+', line)
            # 가격으로 추정되는 부분 (쉼표가 포함된 숫자)
            price_match = re.search(r'([\d,]{2,})', line)

            if name_match and price_match:
                name = name_match.group(0).strip()
                price_str = price_match.group(1).replace(',', '')
                
                # '수량', '단가' 등의 단어가 포함된 라인은 메뉴가 아닐 가능성이 높으므로 제외
                if any(keyword in name for keyword in ['수량', '단가', '합계', '금액', '부가세']):
                    continue
                
                try:
                    price = float(price_str)
                    # 너무 크거나 작은 금액은 제외 (예: 100원 미만, 100만원 초과)
                    if 100 < price < 1000000:
                        items.append({'name': name, 'price': price})
                except ValueError:
                    continue

        return jsonify({'total_price': total_price, 'items': items})

    except Exception as e:
        return jsonify({'error': f'An unexpected error occurred: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True)
