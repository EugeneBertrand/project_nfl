from flask import Flask, request, jsonify
import joblib
import pandas as pd

app = Flask(__name__)

# Load all models
models = {
    'QB': joblib.load('qb_model.pkl'),
    'RB': joblib.load('rb_model.pkl'),
    'WR': joblib.load('wr_model.pkl'),
    'TE': joblib.load('te_model.pkl')
}

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    position = data.get('position')
    if position not in models:
        return jsonify({'error': 'Invalid or missing position'}), 400
    model_data = models[position]
    columns = model_data['columns']
    targets = model_data['targets']
    df = pd.DataFrame([data])
    df = pd.get_dummies(df)
    for col in columns:
        if col not in df:
            df[col] = 0
    df = df[columns]
    preds = model_data['model'].predict(df)[0]
    result = {f'predicted_{target}': float(pred) for target, pred in zip(targets, preds)}
    return jsonify(result)

if __name__ == '__main__':
    app.run(port=5001) 