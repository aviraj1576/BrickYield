from fastapi import APIRouter, Depends
from database import call_proc, get_connection
from auth import developer_only
 
router = APIRouter(prefix="/developer", tags=["Developer"])
 
@router.get("/profile")
def developer_profile(user=Depends(developer_only)):
    dev_id  = user["developer_id"]
    results = call_proc("get_developer_profile", (dev_id,))
    # results[0] = developer profile card
    # results[1] = all property detail rows
    return {
        "profile":    results[0][0] if results[0] else {},
        "properties": results[1]    if len(results) > 1 else [],
    }

@router.get("/revenue")
async def get_developer_revenue(user=Depends(developer_only)):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.callproc("get_developer_revenue_history", [user['user_id']])
        results = list(cursor.stored_results())
        
        raw_rev = results[0].fetchall()
        # Ensure we don't send dummy records to frontend[cite: 1, 4]
        revenue_records = [r for r in raw_rev if r['revenue_id'] != 0]
        
        return {"revenue_records": revenue_records}
    finally:
        cursor.close()
        conn.close()