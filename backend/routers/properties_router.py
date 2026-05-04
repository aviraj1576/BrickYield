from fastapi import APIRouter, Depends, Query
from database import query
from auth import current_user
 
router = APIRouter(prefix="/properties", tags=["Properties"])
 
@router.get("/")
def list_properties(
    city:          str = Query(None),
    property_type: str = Query(None),
    user=Depends(current_user)
):
    # Reads from the property_marketplace_view
    sql    = "SELECT * FROM property_marketplace_view WHERE 1=1"
    params = []
    if city:
        sql += " AND city = %s";          params.append(city)
    if property_type:
        sql += " AND property_type = %s"; params.append(property_type)
    return query(sql, tuple(params))