from flask import Flask, render_template, request, jsonify
import os
import gspread
from oauth2client.service_account import ServiceAccountCredentials
import re
import json

app = Flask(__name__)

def get_google_sheets_client():
    try:
        scope = ['https://spreadsheets.google.com/feeds', 'https://www.googleapis.com/auth/drive']
        
        credentials_json = os.getenv('GOOGLE_CREDENTIALS_JSON')
        if credentials_json:
            credentials_info = json.loads(credentials_json)
            credentials = ServiceAccountCredentials.from_json_keyfile_dict(credentials_info, scope)
        else:
            credentials_path = os.getenv('GOOGLE_CREDENTIALS_PATH', '/tmp/credentials.json')
            if os.path.exists(credentials_path):
                credentials = ServiceAccountCredentials.from_json_keyfile_name(credentials_path, scope)
            else:
                return None, "Google Sheets credentials not found"
        
        client = gspread.authorize(credentials)
        spreadsheet_key = os.getenv('SPREADSHEET_KEY', '17Le1KA9nzMREt0Qp9_elM1OF1q8aSp-GDBZRPOntNI8')
        spreadsheet = client.open_by_key(spreadsheet_key)
        worksheet = spreadsheet.get_worksheet(0)
        return worksheet, "Connected successfully"
    except Exception as e:
        return None, f"Connection failed: {str(e)}"

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/jan-code/<int:index>')
def get_jan_code(index):
    try:
        worksheet, message = get_google_sheets_client()
        if worksheet is None:
            demo_jan_code = f"123456789012{index % 10}"
            return jsonify({
                'success': True,
                'jan_code': demo_jan_code,
                'message': f'Demo mode: {demo_jan_code}',
                'demo_mode': True
            })
        
        cell_address = f'E{index + 1}'
        jan_code = worksheet.acell(cell_address).value
        if jan_code:
            return jsonify({
                'success': True,
                'jan_code': jan_code,
                'message': f'Retrieved JAN code: {jan_code}',
                'demo_mode': False
            })
        else:
            return jsonify({
                'success': False,
                'message': 'JAN code not found at specified position'
            })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error retrieving JAN code: {str(e)}'
        })

@app.route('/api/extract-text', methods=['POST'])
def extract_text():
    try:
        data = request.json
        text = data.get('text', '')
        
        if not text:
            return jsonify({
                'success': False,
                'message': 'No text provided'
            })
        
        extracted = extract_jan_to_weight(text)
        if extracted:
            return jsonify({
                'success': True,
                'extracted_text': extracted,
                'original_text': text
            })
        else:
            return jsonify({
                'success': False,
                'message': 'JAN code or weight information not found',
                'original_text': text
            })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error during text extraction: {str(e)}'
        })

def extract_jan_to_weight(text):
    try:
        jan_pattern = r'\b\d{13}\b|\b\d{8}\b'
        weight_patterns = [
            r'\d+\.?\d*\s*[gG](?![a-zA-Z])',
            r'\d+\.?\d*\s*グラム',
            r'重量\s*[:：]?\s*\d+\.?\d*\s*[gG]?',
            r'\d+\.?\d*\s*ｇ',
        ]

        jan_matches = re.finditer(jan_pattern, text)
        jan_positions = [(match.start(), match.end(), match.group()) for match in jan_matches]

        if not jan_positions:
            return None

        weight_positions = []
        for pattern in weight_patterns:
            weight_matches = re.finditer(pattern, text, re.IGNORECASE)
            weight_positions.extend([(match.start(), match.end(), match.group()) for match in weight_matches])

        if not weight_positions:
            return None

        best_combination = None
        min_distance = float('inf')

        for jan_start, jan_end, jan_code in jan_positions:
            for weight_start, weight_end, weight_text in weight_positions:
                if weight_start >= jan_end:
                    distance = weight_start - jan_end
                else:
                    distance = jan_start - weight_end
                
                if distance >= 0 and distance < min_distance:
                    min_distance = distance
                    if weight_start >= jan_end:
                        best_combination = (jan_start, weight_end, jan_code, weight_text)
                    else:
                        best_combination = (weight_start, jan_end, jan_code, weight_text)

        if best_combination:
            start_pos, end_pos, jan_code, weight_text = best_combination
            extracted_text = text[start_pos:end_pos].strip()
            extracted_text = re.sub(r'\s+', ' ', extracted_text)
            return extracted_text
        else:
            return None

    except Exception as e:
        print(f"Error during text extraction: {str(e)}")
        return None

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
