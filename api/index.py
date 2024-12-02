from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import yfinance as yf

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/api/stock/{symbol}")
async def get_stock_data(symbol: str):
    try:
        stock = yf.Ticker(symbol)
        info = stock.info
        return {
            "symbol": symbol,
            "price": info.get("currentPrice", None),
            "name": info.get("longName", None),
            "change": info.get("regularMarketChangePercent", None),
            "volume": info.get("regularMarketVolume", None),
            "market_cap": info.get("marketCap", None),
        }
    except Exception as e:
        return {"error": str(e)}
