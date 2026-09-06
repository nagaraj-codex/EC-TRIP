import pandas as pd
from sklearn.preprocessing import StandardScaler

def build_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Prepares raw database extracts for Scikit-Learn.
    One-hot encodes categorical features and standardizes continuous variables.
    """
    # 1. One-Hot Encoding
    categorical_cols = ["day_type", "weather_condition"]
    df = pd.get_dummies(df, columns=categorical_cols, drop_first=True)
    
    # 2. Standardization
    scaler = StandardScaler()
    df["ticket_price_paid"] = scaler.fit_transform(df[["ticket_price_paid"]])
    
    return df
