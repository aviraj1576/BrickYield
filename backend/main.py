from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# DIRECT IMPORTS: We point straight to the file and grab the 'router' variable
from routers.auth_router import router as auth_api
from routers.investor_router import router as investor_api
from routers.developer_router import router as developer_api
from routers.properties_router import router as properties_api
from routers.admin_router import router as admin_api

app = FastAPI(title="BrickYield API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# We include the variables we just imported
app.include_router(auth_api)
app.include_router(investor_api)
app.include_router(developer_api)
app.include_router(properties_api)
app.include_router(admin_api)

@app.get("/")
def root():
    return {"status": "BrickYield API running"}