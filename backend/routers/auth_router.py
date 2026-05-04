from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import bcrypt
from database import query, get_connection
from auth import make_token
 
router = APIRouter(prefix="/auth", tags=["Auth"])
 
class LoginReq(BaseModel):
    user_id:  int
    password: str
 
@router.post("/login")
def login(req: LoginReq):
    rows = query(
        "SELECT user_id, password_hash, user_type, kyc_verified, full_name "
        "FROM Users WHERE user_id = %s",
        (req.user_id,)
    )
    if not rows:
        raise HTTPException(401, "User not found")
 
    u = rows[0]
    if not bcrypt.checkpw(req.password.encode(), u["password_hash"].encode()):
        raise HTTPException(401, "Wrong password")
 
    extra = {}
    if u["user_type"] == "investor":
        r = query("SELECT investor_id FROM Investors WHERE user_id=%s", (u["user_id"],))
        extra["investor_id"] = r[0]["investor_id"] if r else None
    elif u["user_type"] == "developer":
        r = query("SELECT developer_id FROM Developers WHERE user_id=%s", (u["user_id"],))
        extra["developer_id"] = r[0]["developer_id"] if r else None
 
    token = make_token({
        "user_id":      u["user_id"],
        "user_type":    u["user_type"],
        "full_name":    u["full_name"],
        "kyc_verified": u["kyc_verified"],
        **extra,
    })
    return {
        "access_token": token,
        "token_type":   "bearer",
        "user_type":    u["user_type"],
        "full_name":    u["full_name"],
        "kyc_verified": u["kyc_verified"],
    }