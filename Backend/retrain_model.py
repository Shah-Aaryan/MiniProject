import pandas as pd
import numpy as np
from sklearn.tree import DecisionTreeClassifier
from sklearn.preprocessing import LabelEncoder
import joblib
import os

# Load data
data = pd.read_csv('datasets/prediction-data.csv')

# Use LabelEncoder for all object columns
le = LabelEncoder()
for col in data.select_dtypes(include=['object']).columns:
    if col != 'Suggested Job Role':
        data[col] = le.fit_transform(data[col])

# Separate features and target
X = data.drop('Suggested Job Role', axis=1)
y = data['Suggested Job Role']

# Train Decision Tree model
dt_model = DecisionTreeClassifier(random_state=42)
dt_model.fit(X, y)

# Save model
model_path = 'ml_models/dtmodel.pkl'
os.makedirs(os.path.dirname(model_path), exist_ok=True)
joblib.dump(dt_model, model_path)

print(f"✅ Model retrained successfully!")
print(f"📊 Training samples: {len(X)}")
print(f"🎯 Features: {X.shape[1]}")
print(f"📁 Model saved to: {model_path}")
print(f"🔢 Unique roles: {y.nunique()}")
print(f"\nRoles: {list(y.unique())}")
