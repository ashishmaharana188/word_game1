from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
import cohere
import httpx

app = FastAPI()
templates = Jinja2Templates(directory="templates")
app.mount("/static", StaticFiles(directory="static"), name="static")

# Initialize the Cohere Client with an API Key
co = cohere.Client("eoG1ggduiCz03Z9nCkIWjAsKCoLiqznOZLRBPq74")

@app.middleware("http")
async def add_cors_header(request: Request, call_next):
    # Extract the Origin header from the request
    origin = request.headers.get("Origin")
    # Allow requests only from the specified origin
    allow_origins = [origin] if origin else []
    
    response = await call_next(request)
    
    # Set the Access-Control-Allow-Origin header in the response
    response.headers["Access-Control-Allow-Origin"] = ",".join(allow_origins)
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    
    return response

@app.get("/")
async def name(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/hint")
async def hint(hintText: str = "default_hint"):
    async with httpx.AsyncClient() as client:
        randomWord_response = await client.get("https://random-word-api.vercel.app/api?words=1")

        if randomWord_response.status_code == 200:
            randomWord = randomWord_response.json()[0]
            randomWordText = randomWord.replace('[?"|"|\\"|]$', "")

            message = f" Generate a strict 20-word limit meaning for {randomWordText} and start the response with hint: and do not mention the {randomWordText} in the description as well as any other text or prompt from your side "
            prediction = co.chat(
                message,
                model="command-nightly",
                temperature=0.9,
            )

            response_data = {randomWordText: prediction.text}
            
            return JSONResponse(content=response_data)
        else:
            return {
                "error": f"Failed to fetch randomWord. Status code: {randomWord_response.status_code}"
            }
