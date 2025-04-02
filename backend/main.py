import uvicorn
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi_app import app

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"message": "An unexpected error occurred."},
    )

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5001)