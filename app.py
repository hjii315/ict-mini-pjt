# -*- coding: utf-8 -*-
from flask import Flask, render_template, request
import math

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

if __name__ == '__main__':
    app.run(debug=True)
