from fastapi import FastAPI, UploadFile, File, HTTPException, Form

from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd

app = FastAPI(title="SME Financial Health Analyzer")

# -------------------------------
# CORS
# -------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------
# MOCK DATABASE 
# -------------------------------
users_db = {}

# -------------------------------
# SCHEMAS
# -------------------------------
class RegisterRequest(BaseModel):
    email: str
    password: str
    business_name: str


class LoginRequest(BaseModel):
    email: str
    password: str


# -------------------------------
# ROOT
# -------------------------------
@app.get("/")
def home():
    return {"message": "SME Financial Health API is running"}


# -------------------------------
# REGISTER
# -------------------------------
@app.post("/register")
def register(data: RegisterRequest):
    if data.email in users_db:
        raise HTTPException(status_code=400, detail="User already exists")

    users_db[data.email] = {
        "password": data.password,
        "business_name": data.business_name,
        "credits": 5  # 🎁 FREE credits
    }

    return {
        "message": "Registered successfully",
        "credits": 5
    }


# -------------------------------
# LOGIN
# -------------------------------
@app.post("/login")
def login(data: LoginRequest):
    user = users_db.get(data.email)

    if not user or user["password"] != data.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return {
        "message": "Login successful",
        "email": data.email,
        "credits": user["credits"]
    }


# -------------------------------
# ANALYZE 
# -------------------------------
@app.post("/analyze")
async def analyze_financials(
    email: str = Form(...),
    file: UploadFile = File(...)
):

    # --- Auth & Credit Check ---
    user = users_db.get(email)
    if not user:
        raise HTTPException(status_code=401, detail="Login required")

    if user["credits"] <= 0:
        raise HTTPException(
            status_code=403,
            detail="No credits left. Please subscribe."
        )

    # Consume 1 credit
    user["credits"] -= 1

    try:
        df = pd.read_csv(file.file)

        required_cols = ["Revenue", "Expenses", "Cash_In", "Cash_Out", "Loan_EMI"]
        for col in required_cols:
            if col not in df.columns:
                raise HTTPException(
                    status_code=400,
                    detail=f"Missing required column: {col}"
                )

        total_revenue = int(df["Revenue"].sum())
        total_expenses = int(df["Expenses"].sum())
        cash_in = int(df["Cash_In"].sum())
        cash_out = int(df["Cash_Out"].sum())
        loan_emi = int(df["Loan_EMI"].sum())

        profit = total_revenue - total_expenses
        cash_flow = cash_in - cash_out
        expense_ratio = (
            (total_expenses / total_revenue) * 100
            if total_revenue else 0.0
        )

        # --- Scoring ---
        score = 0
        score += 30 if profit > 0 else 10
        score += 25 if expense_ratio < 70 else 10
        score += 25 if cash_flow > 0 else 10
        score += 20 if loan_emi < (0.3 * total_revenue) else 10

        return {
            "metrics": {
                "total_revenue": total_revenue,
                "total_expenses": total_expenses,
                "profit": profit,
                "cash_flow": cash_flow,
                "expense_ratio": round(expense_ratio, 2),
                "financial_health_score": score
            },
            "insights": {
                "risk": "High expenses detected"
                if expense_ratio > 70 else "Expenses under control",
                "suggestion": "Improve receivables collection",
                "creditworthiness": f"Score {score}/100 indicates moderate strength"
            },
            "credits_left": user["credits"]
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
from fastapi import Body

@app.post("/subscribe")
def subscribe(email: str = Body(...), credits: int = Body(...)):
    user = users_db.get(email)

    if not user:
        raise HTTPException(status_code=401, detail="Login required")

    user["credits"] += credits

    return {
        "message": "Subscription successful",
        "credits": user["credits"]
    }
