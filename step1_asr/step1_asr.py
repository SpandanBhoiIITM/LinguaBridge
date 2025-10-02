import pyaudio,json
from vosk import Model,KaldiRecognizer
import sys

sys.path.append(r"C:\Users\spand\Desktop\Speech2Speech\step2_asr_mt")
from step2_asr_mt import translate

sys.path.append(r"C:\Users\spand\Desktop\Speech2Speech\step3_asr_mt_tts")
from step3_asr_mt_tts import speak



RATE=16000
CHUNK=800

model = Model(r"C:\Users\spand\Desktop\Speech2Speech\vosk-model-small-en-us-0.15")

rec = KaldiRecognizer(model, RATE)


pa=pyaudio.PyAudio()
stream=pa.open(format=pyaudio.paInt16, channels=1, rate=RATE,
                 input=True, frames_per_buffer=CHUNK)
stream.start_stream()

print("speak into the mic")

try:
    while True:
        data = stream.read(CHUNK, exception_on_overflow=False)
        if rec.AcceptWaveform(data):
            result = json.loads(rec.Result())
            english_text = result.get("text", "")
            if english_text:
                print("English:", english_text)
                hindi_text = translate(english_text)
                print("Hindi:", hindi_text)

                speak(hindi_text)
                
        else:
            partial = json.loads(rec.PartialResult())
            print("...Partial:", partial.get("partial", ""))
except KeyboardInterrupt:
    print("Stopped.")
    stream.stop_stream()
    stream.close()
    pa.terminate()