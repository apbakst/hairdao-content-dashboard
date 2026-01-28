from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from pathlib import Path

app = FastAPI(title="HairDAO Content Dashboard")

@app.get("/", response_class=HTMLResponse)
async def read_root():
    html_path = Path(__file__).parent / "templates" / "index.html"
    return html_path.read_text()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
