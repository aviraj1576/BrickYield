from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from database import call_proc, get_connection, query
from auth import investor_only
 
router = APIRouter(prefix="/investor", tags=["Investor"])
 
@router.get("/profile")
def investor_profile(user=Depends(investor_only)):
    investor_id = user["investor_id"]
    results = call_proc("get_investor_profile", (investor_id,))
    # results[0] = profile card row
    # results[1] = holdings list
    return {
        "profile":  results[0][0] if results[0] else {},
        "holdings": results[1]    if len(results) > 1 else [],
    }
 
class BuyReq(BaseModel):
    property_id: int
    quantity:    int
 
@router.post("/buy")
def buy_shares(req: BuyReq, user=Depends(investor_only)):
    investor_id = user["investor_id"]
    conn   = get_connection()
    cursor = conn.cursor()
    # Call procedure with OUT param placeholder
    cursor.callproc("purchase_shares",
                    (investor_id, req.property_id, req.quantity, ""))
    # Read OUT param
    cursor.execute("SELECT @_purchase_shares_3")
    row = cursor.fetchone()
    cursor.close()
    conn.close()
 
    msg = row[0] if row else "Unknown"
    if msg.startswith("ERROR"):
        raise HTTPException(400, msg)
    return {"message": msg}

@router.get("/history")
async def get_investor_history(user=Depends(investor_only)):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.callproc("get_investor_financial_history", [user['user_id']])
        results = list(cursor.stored_results())
        
        # Logic: If ID is 0, it was a dummy row from the LEFT JOIN[cite: 4]
        raw_tx = results[0].fetchall()
        transactions = [t for t in raw_tx if t['transaction_id'] != 0]
        
        raw_div = results[1].fetchall()
        dividends = [d for d in raw_div if d['payment_id'] != 0]
        
        return {"transactions": transactions, "dividends": dividends}
    finally:
        cursor.close()
        conn.close()