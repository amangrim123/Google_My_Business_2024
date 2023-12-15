from fastapi import FastAPI
from first_sel_v4 import main
import asyncio
# Create an instance of the FastAPI class
app = FastAPI()

# Define a route that responds to the root URL "/"
@app.get("/v1/api")
async def read_root(a):
    loop = asyncio.get_event_loop()
    loop.run_until_complete(main(a))
    loop.close()
    # aaa = await main(a)
    return {"message": "Done"}

@app.get("/")
async def a():
    return {"message":"Api Running"}

# Run the FastAPI application using Uvicorn
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
