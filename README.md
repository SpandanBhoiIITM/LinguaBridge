# 🌐 LinguaBridge

LinguaBridge is a **real-time speech-to-speech translator** that listens to English speech, translates it into Hindi, and speaks it back using TTS.  
It also comes with a **Google Meet extension** that automatically captures live captions, sends them to the backend, and plays the translated speech.

---

## 🚀 Features
- 🎤 **ASR (Speech Recognition)** → Vosk model (English speech → text)  
- 🌍 **Translation** → MarianMT (English → Hindi)  
- 🗣 **TTS (Speech Synthesis)** → Edge-TTS + Pygame for playback  
- ⚡ **FastAPI Backend** → REST endpoints (`/translate`, `/speak`)  
- 🎥 **Google Meet Chrome Extension** → Captures captions and plays translated audio  

---

## 📂 Project Structure
```plaintext
LinguaBridge/
├── app.py                     # FastAPI backend server
├── step1_asr.py               # ASR pipeline (Vosk speech-to-text)
├── step2_asr_mt.py            # Translation (MarianMT)
├── step3_asr_mt_tts.py        # TTS (Edge-TTS + pygame)
├── requirements.txt           # Python dependencies
├── README.md                  # Project documentation
└── meet_translator_extension/ # Chrome extension
    ├── manifest.json
    └── content.js
