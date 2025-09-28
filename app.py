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

    # 우선순위: RECEIPT_*  ->  CLOVA_*
    api_url = os.getenv('RECEIPT_OCR_API_URL') or os.getenv('CLOVA_OCR_API_URL')
    secret_key = os.getenv('RECEIPT_OCR_SECRET_KEY') or os.getenv('CLOVA_OCR_SECRET_KEY')
    # 일부 영수증 API는 헤더 키가 다를 수 있으므로 환경변수로 지정 가능 (기본 CLOVA 호환)
    header_name = os.getenv('RECEIPT_OCR_HEADER_NAME', 'X-OCR-SECRET')

    if not api_url or not secret_key:
        return jsonify({'error': 'Receipt OCR API credentials not configured'}), 500

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
    headers = {header_name: secret_key}

    try:
        response = requests.post(api_url, headers=headers, data=payload, files=files)
        response.raise_for_status() # Raise an exception for bad status codes
        result = response.json()
        # 서버 콘솔에 원본 응답 로깅
        try:
            app.logger.info('[OCR RAW] %s', json.dumps(result, ensure_ascii=False)[:2000])
        except Exception:
            app.logger.info('[OCR RAW] <unserializable>')


        # 1) 구조화된 영수증 응답 우선 파싱 (images[0].receipt.result)
        total_price = 0
        items = []
        import re

        def _get_from_path(obj, path):
            cur = obj
            for k in path:
                if isinstance(cur, dict) and k in cur:
                    cur = cur[k]
                else:
                    return None
            return cur

        def _to_number(val):
            try:
                return float(str(val).replace(',', '').strip())
            except Exception:
                return None

        images = result.get('images', [])
        receipt_block = (images[0] if images else {}).get('receipt') or {}
        receipt_res = receipt_block.get('result') or {}

        if receipt_res:
            # 총액 후보 경로들 탐색
            total_paths = [
                ('totalPrice', 'price', 'formatted', 'value'),
                ('totalPrice', 'price', 'value'),
                ('totalPrice', 'formatted', 'value'),
                ('totalPrice', 'value'),
                ('totalPayment', 'price', 'formatted', 'value'),
                ('totalPayment', 'price', 'value'),
                ('totalPayment', 'value'),
            ]
            for p in total_paths:
                v = _get_from_path(receipt_res, p)
                num = _to_number(v)
                if num and num > 0:
                    total_price = num
                    break

            # 품목 파싱 (subResults[*].items[] 또는 result.items)
            sub_results = receipt_res.get('subResults') or []
            parsed_any = False
            for sr in sub_results:
                for it in sr.get('items', []) or []:
                    # 이름 추출
                    name = None
                    if isinstance(it.get('name'), dict):
                        name = it['name'].get('text') or _get_from_path(it['name'], ('formatted', 'value'))
                    else:
                        name = it.get('name')
                    # 가격 추출
                    price = None
                    price_obj = it.get('price') or {}
                    cand = (
                        _get_from_path(price_obj, ('price', 'formatted', 'value'))
                        or _get_from_path(price_obj, ('price', 'value'))
                        or _get_from_path(price_obj, ('formatted', 'value'))
                        or price_obj.get('value')
                        or it.get('price')
                    )
                    price = _to_number(cand)
                    # 수량 추출
                    qty_cand = (
                        _get_from_path(it, ('count', 'formatted', 'value'))
                        or _get_from_path(it, ('count', 'value'))
                        or _get_from_path(it, ('quantity', 'formatted', 'value'))
                        or _get_from_path(it, ('quantity', 'value'))
                        or it.get('count')
                        or it.get('quantity')
                    )
                    quantity = None
                    try:
                        quantity = int(str(qty_cand).strip()) if qty_cand is not None and str(qty_cand).strip() != '' else None
                    except Exception:
                        quantity = None

                    # 단가 추출
                    unit_obj = it.get('unitPrice') or {}
                    unit_cand = (
                        _get_from_path(unit_obj, ('price', 'formatted', 'value'))
                        or _get_from_path(unit_obj, ('price', 'value'))
                        or _get_from_path(unit_obj, ('formatted', 'value'))
                        or unit_obj.get('value')
                    )
                    unit_price = _to_number(unit_cand)

                    if name and price and 100 < price < 1000000:
                        item_row = {'name': str(name).strip(), 'price': price}
                        if quantity is not None:
                            item_row['quantity'] = quantity
                        if unit_price is not None:
                            item_row['unit_price'] = unit_price
                        items.append(item_row)
                        parsed_any = True

            if not parsed_any:
                # 다른 구조도 시도: result.items
                for it in receipt_res.get('items', []) or []:
                    name = None
                    if isinstance(it.get('name'), dict):
                        name = it['name'].get('text') or _get_from_path(it['name'], ('formatted', 'value'))
                    else:
                        name = it.get('name')
                    cand = (
                        _get_from_path(it, ('price', 'formatted', 'value'))
                        or _get_from_path(it, ('price', 'value'))
                        or it.get('price')
                    )
                    price = _to_number(cand)
                    # 수량
                    qty_cand = (
                        _get_from_path(it, ('count', 'formatted', 'value'))
                        or _get_from_path(it, ('count', 'value'))
                        or _get_from_path(it, ('quantity', 'formatted', 'value'))
                        or _get_from_path(it, ('quantity', 'value'))
                        or it.get('count')
                        or it.get('quantity')
                    )
                    quantity = None
                    try:
                        quantity = int(str(qty_cand).strip()) if qty_cand is not None and str(qty_cand).strip() != '' else None
                    except Exception:
                        quantity = None

                    # 단가
                    unit_obj = it.get('unitPrice') or {}
                    unit_cand = (
                        _get_from_path(unit_obj, ('price', 'formatted', 'value'))
                        or _get_from_path(unit_obj, ('price', 'value'))
                        or _get_from_path(unit_obj, ('formatted', 'value'))
                        or unit_obj.get('value')
                    )
                    unit_price = _to_number(unit_cand)

                    if name and price and 100 < price < 1000000:
                        item_row = {'name': str(name).strip(), 'price': price}
                        if quantity is not None:
                            item_row['quantity'] = quantity
                        if unit_price is not None:
                            item_row['unit_price'] = unit_price
                        items.append(item_row)

        # 2) 텍스트 기반 파싱 (구조화 파싱 실패 시 보조)
        if total_price == 0 and not items:
            all_text = ""
            fields = (images[0] if images else {}).get('fields', [])
            for field in fields:
                all_text += field.get('inferText', '') + ('\n' if field.get('lineBreak') else ' ')

            # 서버 콘솔에 추출 텍스트 로깅
            app.logger.info('[OCR TEXT]\n%s', all_text[:2000])

            lines = all_text.split('\n')
            
            # 총액 키워드 순방향 스캔
            total_keywords = ['합계', '총액', '받을금액']
            for line in lines:
                for keyword in total_keywords:
                    if keyword in line:
                        numbers = re.findall(r'[\d,]+', line)
                        if numbers:
                            num = _to_number(numbers[-1])
                            if num and num > 0:
                                total_price = num
                                break
                if total_price > 0:
                    break

            # 품목 라인 추정
            for line in lines:
                name_match = re.search(r'^[가-힣a-zA-Z\s]+', line)
                price_match = re.search(r'([\d,]{2,})', line)
                if name_match and price_match:
                    name = name_match.group(0).strip()
                    price_str = price_match.group(1)
                    num = _to_number(price_str)
                    if any(k in name for k in ['수량', '단가', '합계', '금액', '부가세']):
                        continue
                    if num and 100 < num < 1000000:
                        # 수량/단가 간단 추출 (예: "x2", "2개", "수량 2")
                        qty = None
                        unit_price = None
                        m_qty = re.search(r'[xX](\d+)|(\d+)\s*개|수량\s*(\d+)', line)
                        if m_qty:
                            qty = next((int(g) for g in m_qty.groups() if g), None)
                            if qty and qty > 0:
                                # 단가 추정: 총액/수량
                                unit_price = round(num / qty, 2)
                        item_row = {'name': name, 'price': num}
                        if qty:
                            item_row['quantity'] = qty
                        if unit_price:
                            item_row['unit_price'] = unit_price
                        items.append(item_row)

        # 추출 요약 로깅
        try:
            preview_items = items[:5]
            app.logger.info('[EXTRACTED] total_price=%s, items_count=%d, items_preview=%s', total_price, len(items), json.dumps(preview_items, ensure_ascii=False))
        except Exception:
            pass

        return jsonify({'total_price': total_price, 'items': items})

    except Exception as e:
        return jsonify({'error': f'An unexpected error occurred: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True)
