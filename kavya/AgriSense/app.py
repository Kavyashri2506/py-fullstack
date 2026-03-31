from flask import Flask, render_template, request, jsonify
import sqlite3
import random
import os

app = Flask(__name__)

# Mocked DB Setup
def init_db():
    conn = sqlite3.connect('agrisense.db')
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS predictions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            location TEXT,
            soil_type TEXT,
            temperature REAL,
            rainfall REAL,
            recommended_crop TEXT
        )
    ''')
    conn.commit()
    conn.close()

if not os.path.exists('agrisense.db'):
    init_db()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/recommend', methods=['POST'])
def recommend_crop():
    data = request.json
    
    # 1. Gather all inputs
    temp = float(data.get('temperature', 25))
    rain = float(data.get('rainfall', 100))
    humidity = float(data.get('humidity', '60') or 60)
    ph = float(data.get('ph', '6.5') or 6.5)
    soil = data.get('soilType', 'loamy').lower()
    location = data.get('location', 'General').lower()
    
    # 2. Hybrid Engine: ML Model Simulator (Top Crops)
    # In a real app, this would be: model.predict_proba([[N, P, K, temp, rain, humidity, ph]])
    # We simulate a smart response based on some basic rules + randomness
    top_crops = []
    if soil == 'clay' and rain >= 150:
        top_crops = [
            {"name": "Rice", "score": random.randint(88, 95)},
            {"name": "Sugarcane", "score": random.randint(75, 85)},
            {"name": "Jute", "score": random.randint(65, 75)}
        ]
    elif soil == 'sandy' or rain < 60:
        top_crops = [
            {"name": "Millets", "score": random.randint(88, 95)},
            {"name": "Groundnut", "score": random.randint(75, 85)},
            {"name": "Cotton", "score": random.randint(60, 70)}
        ]
    elif location == 'tamil nadu':
        top_crops = [
            {"name": "Rice", "score": random.randint(85, 95)},
            {"name": "Sugarcane", "score": random.randint(80, 88)},
            {"name": "Groundnut", "score": random.randint(70, 80)}
        ]
    else:
        top_crops = [
            {"name": "Wheat", "score": random.randint(85, 92)},
            {"name": "Maize", "score": random.randint(75, 85)},
            {"name": "Soybean", "score": random.randint(65, 75)}
        ]
        
    # Sort by score descending
    top_crops = sorted(top_crops, key=lambda x: x['score'], reverse=True)
    best_crop = top_crops[0]['name']
    
    # 3. Hybrid Engine: Seasonal Planning
    seasonal_plan = {
        "summer": ["Maize", "Groundnut", "Green Gram"],
        "kharif": ["Rice", "Sugarcane", "Soybean"] if rain > 100 else ["Millets", "Cotton", "Maize"],
        "rabi": ["Wheat", "Barley", "Mustard", "Chickpea"]
    }
    
    # 4. Hybrid Engine: Crop Rotation Recommendations
    rotation_map = {
        "Rice": "After Rice, grow Legumes (like Pulses or Beans) to restore soil Nitrogen.",
        "Wheat": "After Wheat, consider a deep-root crop like Mustard or Legume to balance soil nutrients.",
        "Sugarcane": "Sugarcane exhausts soil heavily. Fallow or Green Manure is recommended before the next major crop.",
        "Millets": "Millet is light on soil. You can follow it with a cash crop like Cotton or Groundnut."
    }
    rotation_advice = rotation_map.get(best_crop, f"After {best_crop}, plant a nitrogen-fixing legume to maintain soil health and long-term productivity.")
    
    # 5. Hybrid Engine: Risk & Advisory System Alerts
    alerts = []
    if rain < 50:
        alerts.append({"type": "warning", "msg": "Low rainfall detected. Avoid water-intensive crops like Rice or Sugarcane. Ensure irrigation is available."})
    if humidity > 80:
        alerts.append({"type": "danger", "msg": "High humidity >80%. Severe risk of fungal disease (blight/rust). Preventative fungicide recommended."})
    if ph < 5.5:
        alerts.append({"type": "warning", "msg": "Soil is highly acidic. Consider applying agricultural lime to neutralize it."})
    if ph > 8.0:
        alerts.append({"type": "warning", "msg": "Soil is highly alkaline. Consider applying sulfur or organic compost."})
        
    if not alerts:
        alerts.append({"type": "success", "msg": "Environmental conditions are optimal for standard farming practices."})

    return jsonify({
        'status': 'success',
        'top_crops': top_crops,
        'seasonal_plan': seasonal_plan,
        'rotation_advice': rotation_advice,
        'alerts': alerts
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
