from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import yfinance as yf
from datetime import datetime, timedelta
import logging

app = FastAPI()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/api/stock/{symbol}")
async def get_stock_data(symbol: str):
    logger.info(f"Received request for symbol: {symbol}")
    try:
        logger.info(f"Fetching data for symbol: {symbol}")
        stock = yf.Ticker(symbol)
        
        # First verify we can get basic info
        try:
            logger.info(f"Attempting to fetch info for {symbol}")
            info = stock.info
            if not info:
                logger.error(f"No basic info found for symbol: {symbol}")
                raise HTTPException(status_code=404, detail=f"No basic info found for symbol: {symbol}")
            logger.info(f"Successfully fetched basic info for {symbol}")
        except Exception as e:
            logger.error(f"Error fetching basic info for {symbol}: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Error fetching basic info for {symbol}: {str(e)}")

        # Get historical data for candlestick chart
        end_date = datetime.now()
        start_date = end_date - timedelta(days=30)
        
        try:
            logger.info(f"Fetching historical data for {symbol}")
            history = stock.history(start=start_date, end=end_date)
            if history.empty:
                logger.error(f"No historical data found for symbol: {symbol}")
                raise HTTPException(status_code=404, detail=f"No data found for symbol: {symbol}")
            logger.info(f"Successfully fetched {len(history)} historical records for {symbol}")
        except Exception as e:
            logger.error(f"Error fetching historical data for {symbol}: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to fetch historical data for {symbol}: {str(e)}")

        # Format historical data
        historical_data = []
        try:
            for index, row in history.iterrows():
                historical_data.append({
                    "date": index.strftime("%Y-%m-%d"),
                    "open": float(row["Open"]),
                    "high": float(row["High"]),
                    "low": float(row["Low"]),
                    "close": float(row["Close"]),
                    "volume": int(row["Volume"])
                })
            logger.info(f"Successfully processed {len(historical_data)} historical records for {symbol}")
        except Exception as e:
            logger.error(f"Error processing historical data for {symbol}: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Error processing historical data for {symbol}: {str(e)}")

        # Prepare response
        try:
            response_data = {
                "symbol": symbol,
                "currentValue": float(info.get("currentPrice", 0)),
                "percentageChange": float(info.get("regularMarketChangePercent", 0)),
                "previousClose": float(info.get("regularMarketPreviousClose", 0)),
                "volume": int(info.get("regularMarketVolume", 0)),
                "marketCap": float(info.get("marketCap", 0)),
                "high": float(info.get("dayHigh", 0)),
                "low": float(info.get("dayLow", 0)),
                "open": float(info.get("regularMarketOpen", 0)),
                "close": float(info.get("regularMarketPrice", 0)),
                "historicalData": historical_data
            }
            logger.info(f"Successfully prepared response for {symbol}")
            return response_data
        except Exception as e:
            logger.error(f"Error preparing response data for {symbol}: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Error preparing response data for {symbol}: {str(e)}")

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error processing {symbol}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Unexpected error processing {symbol}: {str(e)}")
