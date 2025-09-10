import pandas as pd
from datetime import datetime, timedelta
import sys
import json

def predict_cycle(period_data):
    """
    Predicts future period and ovulation dates based on past data.
    
    Args:
        period_data (list of dict): A list of period ranges, e.g.,
            [{'start': '2025-08-01', 'end': '2025-08-05'},
             {'start': '2025-09-01', 'end': '2025-09-05'}]

    Returns:
        dict: A dictionary with 'predicted_period' and 'predicted_ovulation'.
    """
    if len(period_data) < 2:
        return {
            'predictedPeriod': None,
            'predictedOvulation': None,
            'message': 'Need at least 2 period logs for prediction.'
        }

    df = pd.DataFrame(period_data)
    df['start'] = pd.to_datetime(df['start'])
    df['end'] = pd.to_datetime(df['end'])
    df = df.sort_values('start')
    
    df['cycle_length'] = df['start'].diff().dt.days
    
    df = df.dropna(subset=['cycle_length'])
    
    if not df.empty:
        average_cycle_length = int(df['cycle_length'].mean())
    else:
        average_cycle_length = 28
    
    last_period_start = df['start'].iloc[-1]
    next_period_start = last_period_start + timedelta(days=average_cycle_length)
    
    last_period_duration = (df['end'].iloc[-1] - last_period_start).days + 1
    next_period_end = next_period_start + timedelta(days=last_period_duration - 1)
    
    ovulation_date = next_period_start - timedelta(days=14)
    ovulation_window = [
        (ovulation_date - timedelta(days=2)).strftime('%Y-%m-%d'),
        (ovulation_date + timedelta(days=2)).strftime('%Y-%m-%d')
    ]
    
    return {
        'predictedPeriod': {
            'start': next_period_start.strftime('%Y-%m-%d'),
            'end': next_period_end.strftime('%Y-%m-%d'),
        },
        'predictedOvulation': ovulation_window,
    }

# Read input from stdin
if __name__ == '__main__':
    input_data = sys.stdin.read()
    try:
        period_data = json.loads(input_data)
        predictions = predict_cycle(period_data)
        print(json.dumps(predictions))
    except json.JSONDecodeError as e:
        print(json.dumps({'error': 'Invalid JSON input', 'details': str(e)}))