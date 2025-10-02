import edge_tts
import asyncio
import pygame
import io

def speak(text: str):
    if text.strip():
        print(f"Speaking: {text}")
        pygame.mixer.init()
        asyncio.run(_speak_async(text))

async def _speak_async(text: str):
    communicate = edge_tts.Communicate(text, "hi-IN-SwaraNeural")
    audio_data = b""
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            audio_data += chunk["data"]
    
    pygame.mixer.music.load(io.BytesIO(audio_data))
    pygame.mixer.music.play()
    
    while pygame.mixer.music.get_busy():
        await asyncio.sleep(0.1)