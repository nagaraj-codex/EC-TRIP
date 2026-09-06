import numpy as np
from sklearn.metrics import mean_absolute_error, mean_squared_error, accuracy_score

def evaluate_regression(y_true, y_pred):
    mae = mean_absolute_error(y_true, y_pred)
    rmse = np.sqrt(mean_squared_error(y_true, y_pred))
    return {"MAE": mae, "RMSE": rmse}

def evaluate_classification(y_true, y_pred):
    acc = accuracy_score(y_true, y_pred)
    return {"Accuracy": acc}
