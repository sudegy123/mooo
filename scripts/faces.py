# Face box (centre x, centre y, width) at given times, with the YuNet model bundled in the effects skill.
# usage: python -I faces.py <video> <t1> [t2 ...]
import sys, subprocess, json
import numpy as np, cv2
MODEL = r'G:\sudegy-video-studio\.claude\skills\effects\models\yunet.onnx'
src, times = sys.argv[1], [float(x) for x in sys.argv[2:]]
out = {}
for t in times:
    png = subprocess.run(['ffmpeg', '-v', 'error', '-ss', str(t), '-i', src, '-frames:v', '1', '-f', 'image2pipe', '-vcodec', 'png', '-'], capture_output=True, check=True).stdout
    img = cv2.imdecode(np.frombuffer(png, np.uint8), cv2.IMREAD_COLOR)
    h, w = img.shape[:2]
    det = cv2.FaceDetectorYN.create(MODEL, '', (w, h), 0.6, 0.3, 20)
    _, faces = det.detect(img)
    if faces is None or not len(faces): out[t] = None; continue
    x, y, fw, fh = max(faces, key=lambda f: f[2] * f[3])[:4]
    out[t] = {'cx': round(float(x + fw / 2), 1), 'cy': round(float(y + fh / 2), 1), 'w': round(float(fw), 1)}
print(json.dumps(out))
