from flask import Flask, render_template, request, jsonify, session, redirect, url_for, send_from_directory
import json
import os
import base64
from datetime import datetime
from collections import defaultdict

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'your-secret-key-change-in-production')

# Configuration
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'admin123')
DATA_DIR = 'data'
IMAGES_DIR = os.path.join(DATA_DIR, 'images')
SURVEYS_FILE = os.path.join(DATA_DIR, 'surveys.json')
RESPONSES_FILE = os.path.join(DATA_DIR, 'responses.json')

# Ensure directories exist
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(IMAGES_DIR, exist_ok=True)

def load_surveys():
    """Load surveys from file"""
    if os.path.exists(SURVEYS_FILE):
        with open(SURVEYS_FILE, 'r') as f:
            return json.load(f)
    return []

def save_surveys(surveys):
    """Save surveys to file"""
    with open(SURVEYS_FILE, 'w') as f:
        json.dump(surveys, f, indent=2)

def load_responses():
    """Load responses from file"""
    if os.path.exists(RESPONSES_FILE):
        with open(RESPONSES_FILE, 'r') as f:
            return json.load(f)
    return []

def save_responses(responses):
    """Save responses to file"""
    with open(RESPONSES_FILE, 'w') as f:
        json.dump(responses, f, indent=2)

def update_survey_first_response(survey_id):
    """Update first_response_at if not set"""
    surveys = load_surveys()
    for survey in surveys:
        if survey['id'] == survey_id and not survey.get('first_response_at'):
            survey['first_response_at'] = datetime.now().isoformat()
            save_surveys(surveys)
            break

@app.route('/')
def index():
    """Main landing page"""
    return render_template('index.html')

@app.route('/surveys')
def surveys():
    """Survey list page for users"""
    all_surveys = load_surveys()
    return render_template('surveys.html', surveys=all_surveys)

@app.route('/survey/<survey_id>')
def survey_form(survey_id):
    """Individual survey form"""
    surveys = load_surveys()
    survey = next((s for s in surveys if s['id'] == survey_id), None)
    if not survey:
        return "Survey not found", 404

    # Get language from query parameter or default to English
    lang = request.args.get('lang', 'en')

    return render_template('survey_form.html', survey=survey, lang=lang)

@app.route('/api/submit-survey', methods=['POST'])
def submit_survey():
    """Submit survey response"""
    data = request.json
    responses = load_responses()

    response = {
        'survey_id': data['survey_id'],
        'selected_items': data['selected_items'],  # List of item IDs
        'timestamp': datetime.now().isoformat()
    }

    responses.append(response)
    save_responses(responses)

    # Update first_response_at if not set
    update_survey_first_response(data['survey_id'])

    return jsonify({'success': True})

@app.route('/admin/login', methods=['GET', 'POST'])
def admin_login():
    """Admin login page"""
    if request.method == 'POST':
        password = request.form.get('password')
        if password == ADMIN_PASSWORD:
            session['admin'] = True
            return redirect(url_for('admin_dashboard'))
        return render_template('admin_login.html', error='Invalid password')
    return render_template('admin_login.html')

@app.route('/admin/logout')
def admin_logout():
    """Admin logout"""
    session.pop('admin', None)
    return redirect(url_for('index'))

@app.route('/admin')
def admin_dashboard():
    """Admin dashboard"""
    if not session.get('admin'):
        return redirect(url_for('admin_login'))
    surveys = load_surveys()
    return render_template('admin_dashboard.html', surveys=surveys)

@app.route('/admin/survey/new', methods=['GET', 'POST'])
def admin_new_survey():
    """Create new survey"""
    if not session.get('admin'):
        return redirect(url_for('admin_login'))

    if request.method == 'POST':
        data = request.json
        surveys = load_surveys()

        # Generate ID
        survey_id = str(len(surveys) + 1)

        # Process items and save images
        items = []
        for item in data['items']:
            processed_item = {
                'id': item['id'],
                'text': item.get('text', '')
            }

            # Save image if present
            if 'imageData' in item and item['imageData']:
                image_data = base64.b64decode(item['imageData'])
                image_path = os.path.join(IMAGES_DIR, item['image'])

                with open(image_path, 'wb') as f:
                    f.write(image_data)

                processed_item['image'] = item['image']

            items.append(processed_item)

        survey = {
            'id': survey_id,
            'title_en': data.get('title_en', data.get('title', '')),
            'title_sv': data.get('title_sv', data.get('title', '')),
            'description_en': data.get('description_en', data.get('description', '')),
            'description_sv': data.get('description_sv', data.get('description', '')),
            'items': items,
            'created_at': datetime.now().isoformat(),
            'first_response_at': None
        }

        surveys.append(survey)
        save_surveys(surveys)

        return jsonify({'success': True, 'survey_id': survey_id})

    return render_template('admin_new_survey.html')

@app.route('/admin/survey/<survey_id>/edit', methods=['GET', 'POST'])
def admin_edit_survey(survey_id):
    """Edit existing survey"""
    if not session.get('admin'):
        return redirect(url_for('admin_login'))

    surveys = load_surveys()
    survey = next((s for s in surveys if s['id'] == survey_id), None)

    if not survey:
        return "Survey not found", 404

    if request.method == 'POST':
        data = request.json

        # Process items and save images
        items = []
        for item in data['items']:
            processed_item = {
                'id': item['id'],
                'text': item.get('text', '')
            }

            # Handle existing image
            if 'existing_image' in item and item['existing_image']:
                processed_item['image'] = item['existing_image']

            # Save new image if present
            if 'imageData' in item and item['imageData']:
                image_data = base64.b64decode(item['imageData'])
                image_path = os.path.join(IMAGES_DIR, item['image'])

                with open(image_path, 'wb') as f:
                    f.write(image_data)

                processed_item['image'] = item['image']

            items.append(processed_item)

        # Update survey
        survey['title_en'] = data.get('title_en', '')
        survey['title_sv'] = data.get('title_sv', '')
        survey['description_en'] = data.get('description_en', '')
        survey['description_sv'] = data.get('description_sv', '')
        survey['items'] = items

        save_surveys(surveys)

        return jsonify({'success': True, 'survey_id': survey_id})

    return render_template('admin_edit_survey.html', survey=survey)

@app.route('/admin/survey/<survey_id>/delete', methods=['POST'])
def admin_delete_survey(survey_id):
    """Delete a survey"""
    if not session.get('admin'):
        return redirect(url_for('admin_login'))

    surveys = load_surveys()
    survey = next((s for s in surveys if s['id'] == survey_id), None)

    if survey:
        # Remove images
        for item in survey.get('items', []):
            if 'image' in item:
                image_path = os.path.join(IMAGES_DIR, item['image'])
                if os.path.exists(image_path):
                    os.remove(image_path)

        # Remove survey
        surveys = [s for s in surveys if s['id'] != survey_id]
        save_surveys(surveys)

    return jsonify({'success': True})

@app.route('/admin/survey/<survey_id>/duplicate', methods=['POST'])
def admin_duplicate_survey(survey_id):
    """Duplicate a survey with a new name and fresh ratings"""
    if not session.get('admin'):
        return redirect(url_for('admin_login'))

    data = request.json
    new_title_en = data.get('new_title_en', '')
    new_title_sv = data.get('new_title_sv', '')

    surveys = load_surveys()
    survey = next((s for s in surveys if s['id'] == survey_id), None)

    if not survey:
        return jsonify({'success': False, 'error': 'Survey not found'}), 404

    # Generate new ID
    new_survey_id = str(max([int(s['id']) for s in surveys]) + 1)

    # Copy items and duplicate image files
    new_items = []
    import shutil
    for idx, item in enumerate(survey['items']):
        new_item = {
            'id': f"{new_survey_id}_{item['id']}",
            'text': item.get('text', '')
        }

        # Copy image file if it exists
        if 'image' in item:
            old_image_path = os.path.join(IMAGES_DIR, item['image'])
            if os.path.exists(old_image_path):
                # Create new filename for the duplicated image
                extension = item['image'].split('.')[-1]
                new_image_name = f"{new_survey_id}_{idx}_{datetime.now().timestamp()}.{extension}"
                new_image_path = os.path.join(IMAGES_DIR, new_image_name)

                # Copy the image file
                shutil.copy2(old_image_path, new_image_path)
                new_item['image'] = new_image_name

        new_items.append(new_item)

    # Create new survey
    new_survey = {
        'id': new_survey_id,
        'title_en': new_title_en,
        'title_sv': new_title_sv,
        'description_en': survey.get('description_en', ''),
        'description_sv': survey.get('description_sv', ''),
        'items': new_items,
        'created_at': datetime.now().isoformat(),
        'first_response_at': None
    }

    surveys.append(new_survey)
    save_surveys(surveys)

    return jsonify({'success': True, 'survey_id': new_survey_id})

@app.route('/admin/survey/<survey_id>/reset', methods=['POST'])
def admin_reset_survey(survey_id):
    """Reset all ratings for a survey"""
    if not session.get('admin'):
        return redirect(url_for('admin_login'))

    surveys = load_surveys()
    survey = next((s for s in surveys if s['id'] == survey_id), None)

    if not survey:
        return jsonify({'success': False, 'error': 'Survey not found'}), 404

    # Remove all responses for this survey
    responses = load_responses()
    responses = [r for r in responses if r['survey_id'] != survey_id]
    save_responses(responses)

    # Reset first_response_at
    survey['first_response_at'] = None
    save_surveys(surveys)

    return jsonify({'success': True})

@app.route('/images/<filename>')
def serve_image(filename):
    """Serve uploaded images"""
    return send_from_directory(IMAGES_DIR, filename)

@app.route('/admin/survey/<survey_id>/results')
def admin_survey_results(survey_id):
    """View survey results"""
    if not session.get('admin'):
        return redirect(url_for('admin_login'))

    surveys = load_surveys()
    survey = next((s for s in surveys if s['id'] == survey_id), None)

    if not survey:
        return "Survey not found", 404

    # Calculate statistics
    responses = load_responses()
    survey_responses = [r for r in responses if r['survey_id'] == survey_id]

    total_responses = len(survey_responses)

    # Count selections for each item
    item_stats = []
    for item in survey['items']:
        item_id = item['id']
        count = 0

        for response in survey_responses:
            if item_id in response.get('selected_items', []):
                count += 1

        percentage = (count / total_responses * 100) if total_responses > 0 else 0

        item_stats.append({
            'id': item_id,
            'text': item.get('text', ''),
            'image': item.get('image', ''),
            'count': count,
            'percentage': round(percentage, 1)
        })

    # Sort by count descending
    item_stats.sort(key=lambda x: x['count'], reverse=True)

    return render_template('admin_results.html', survey=survey, item_stats=item_stats, total_responses=total_responses)

if __name__ == '__main__':
    # Get debug mode from environment or default to True for development
    debug_mode = os.environ.get('FLASK_DEBUG', 'True').lower() in ('true', '1', 'yes')
    port = int(os.environ.get('PORT', 5000))

    print(f"\n{'='*50}")
    print(f"Survey Kiosk Application Starting")
    print(f"{'='*50}")
    print(f"Mode: {'Development (Debug ON)' if debug_mode else 'Production'}")
    print(f"URL: http://localhost:{port}")
    print(f"Admin Password: {ADMIN_PASSWORD}")
    print(f"Data Directory: {os.path.abspath(DATA_DIR)}")
    print(f"{'='*50}\n")

    app.run(host='0.0.0.0', port=port, debug=debug_mode)
