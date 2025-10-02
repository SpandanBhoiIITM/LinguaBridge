from fastapi import FastAPI
from pydantic import BaseModel
from step2_asr_mt.step2_asr_mt import translate
from step3_asr_mt_tts.step3_asr_mt_tts import speak

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Item(BaseModel):
    text: str

@app.post("/translate")
def translate_text(item: Item):
    return {"translated": translate(item.text)}

@app.post("/speak")
def speak_text(item: Item):
    translated_text = translate(item.text)
    # This will trigger speech output
    speak(translated_text)
    return {"translated": translated_text}
