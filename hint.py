import cohere
from fastapi import FastAPI, Request
import httpx
from fastapi.responses import JSONResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
origins = ["https://word-game1-cb28o62lg-ashish-maharanas-projects.vercel.app",
           "https://word-game1.vercel.app/hint"]
# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://word-game1-jxbzgc3rs-ashish-maharanas-projects.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

templates = Jinja2Templates(directory="templates")
app.mount("/static", StaticFiles(directory="static"), name="static")


# initialize the Cohere Client with an API Key
co = cohere.Client("eoG1ggduiCz03Z9nCkIWjAsKCoLiqznOZLRBPq74")


@app.get("/")
async def name(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@app.get("/hint")
async def hint(hintText: str = "default_hint"):
    async with httpx.AsyncClient() as client:
        randomWord_response = await client.get(
            "https://random-word-api.vercel.app/api?words=1"
        )
        print(randomWord_response)

        if randomWord_response.status_code == 200:
            print("API Response Content:", randomWord_response.text)
            randomWord = randomWord_response.json()[0]
            randomWordText = randomWord.replace('[?"|"|\\"|]$', "")
            print(randomWordText)

            # generate a prediction for a prompt
            message = f" Generate a strict 20 word limit meaning for {randomWordText} and start the response with hint: and do not mention the {randomWordText} in the description aswell as any other text or prompt from your side "
            prediction = co.chat(
                message,
                model="command-nightly",
                temperature=0.9,
            )

            # dictionary
            response_data = {randomWordText: prediction.text}

            # print the predicted text
            print(f"Chatbot: {response_data}")

            return JSONResponse(content=response_data)
        else:
            return {
                "error": f"Failed to fetch randomWord. Status code: {randomWord_response.status_code}"
            }
