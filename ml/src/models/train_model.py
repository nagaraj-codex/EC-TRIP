import joblib
import pandas as pd
from sklearn.tree import DecisionTreeClassifier

def train_and_export(X_train: pd.DataFrame, y_train: pd.Series, output_path: str = "queuecut_dtree_v1.joblib"):
    """
    Trains an interpretable Decision Tree Classifier.
    Enforces the 300-row invariant before deployment.
    """
    num_rows = len(X_train)
    if num_rows < 300:
        print(f"⚠️ WARNING: Training dataset contains {num_rows} rows. "
              "Minimum 300 required for ML Gate routing. "
              "The model will train, but FastAPI must remain in Rule-Based mode.")
              
    model = DecisionTreeClassifier(max_depth=5, random_state=42)
    model.fit(X_train, y_train)
    
    joblib.dump(model, output_path)
    print(f"Model exported successfully to {output_path}")
    
    return model
