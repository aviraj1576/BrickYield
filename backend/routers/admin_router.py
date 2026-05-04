from fastapi import APIRouter, Depends, HTTPException
from database import get_connection
from auth import current_user  # Using your existing auth logic[cite: 2]

router = APIRouter(prefix="/admin", tags=["Admin"])

# Admin check dependency
def admin_only(user=Depends(current_user)):
    if user.get("user_type") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

@router.get("/users")
async def get_all_users(admin=Depends(admin_only)):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT user_id, full_name, email, user_type, kyc_verified FROM users")
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

@router.post("/verify-user")
async def verify_user(payload: dict, admin=Depends(admin_only)):
    user_id = payload.get("user_id")
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("UPDATE users SET kyc_verified = 1 WHERE user_id = %s", (user_id,))
        conn.commit()
        return {"message": f"User {user_id} verified successfully."}
    finally:
        cursor.close()
        conn.close()

@router.get("/report")
async def get_system_report(admin=Depends(admin_only)):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.callproc("get_admin_system_report")
        results = list(cursor.stored_results())
        
        # Capture stats and use .get() with defaults to handle NULLs
        raw_stats = results[0].fetchone()
        report_data = {k: (v if v is not None else 0) for k, v in raw_stats.items()}
        
        # Capture properties and ensure list is returned
        raw_props = results[1].fetchall()
        report_data["properties"] = []
        for prop in raw_props:
            # Map SQL results to exact keys expected by Recharts
            report_data["properties"].append({
                "name": prop.get("name", "Unknown"),
                "revenue": prop.get("revenue") or 0,
                "expenses": prop.get("expenses") or 0,
                "net": prop.get("net") or 0
            })
        
        return report_data
    except Exception as e:
        # Check console for specific MySQL error messages if this triggers[cite: 3]
        print(f"Backend SQL Error: {e}")
        raise HTTPException(status_code=500, detail="Database error during report generation")
    finally:
        cursor.close()
        conn.close()

@router.post("/payout-dividends")
async def payout_dividends(admin=Depends(admin_only)):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        # Trigger the null-safe procedure
        cursor.callproc("process_dividend_payout")
        conn.commit()
        return {"message": "Dividend payout completed successfully!"}
    except Exception as e:
        # This will print the specific MySQL error to your terminal
        print(f"PROCEDURE ERROR: {str(e)}") 
        raise HTTPException(status_code=500, detail=f"Database Error: {str(e)}")
    finally:
        cursor.close()
        conn.close()