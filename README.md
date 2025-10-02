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
LinguaBridge/
├── app.py # FastAPI backend server
├── step1_asr.py # ASR pipeline (Vosk speech-to-text)
├── step2_asr_mt.py # Translation (MarianMT)
├── step3_asr_mt_tts.py # TTS (Edge-TTS + pygame)
├── requirements.txt # Python dependencies
├── README.md # Project documentation
└── meet_translator_extension/ # Chrome extension
├── manifest.json
└── content.js

yaml
Copy code

---

## ⚙️ Installation

### 1️⃣ Clone the repo
```bash
git clone https://github.com/SpandanBhoiIITM/LinguaBridge.git
cd LinguaBridge
2️⃣ Install Python dependencies
bash
Copy code
pip install -r requirements.txt
3️⃣ Run the backend
bash
Copy code
uvicorn app:app --reload --host 127.0.0.1 --port 8000
Backend endpoints:

POST /translate → { "text": "Hello" } → { "translated": "नमस्ते" }

POST /speak → { "text": "Hello" } → speaks Hindi audio

Quick test:

bash
Copy code
curl -X POST http://127.0.0.1:8000/speak \
  -H "Content-Type: application/json" \
  -d "{\"text\":\"Hello, how are you?\"}"
🖥 Chrome Extension Setup
Open chrome://extensions/ in Chrome.

Enable Developer mode.

Click Load unpacked.

Select the meet_translator_extension/ folder.

Open Google Meet, turn on captions (CC).

✅ The extension captures captions, sends them to the backend, and plays translated Hindi speech.

🔮 Future Work
🔁 Two-way translation (English ↔ Hindi)

🌍 Support for more languages

🎛 Extension UI for language & backend settings

🧑‍🤝‍🧑 Team collaboration features

yaml
Copy code
