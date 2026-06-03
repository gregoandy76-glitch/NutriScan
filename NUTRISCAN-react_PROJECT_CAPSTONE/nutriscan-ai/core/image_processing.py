import cv2
import numpy as np

def process_image_bytes(img_bytes):
    """Mengubah byte gambar langsung menjadi format RGB OpenCV di memori"""
    nparr = np.frombuffer(img_bytes, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if image is None:
        return None
    return cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

def predict_and_crop(image_rgb, model, padding=30):
    """Melakukan prediksi Bounding Box dan mengembalikan hasil potongan gambar"""
    h, w, _ = image_rgb.shape

    # Preprocess gambar khusus untuk input model (416x416)
    input_image = cv2.resize(image_rgb, (416, 416))
    input_image = input_image.astype(np.float32) / 255.0
    input_image = np.expand_dims(input_image, axis=0)

    # Prediksi Koordinat Bounding Box
    prediction = model.predict(input_image, verbose=0)
    xmin, ymin, xmax, ymax = prediction[0]

    # Kembalikan skala koordinat ke ukuran asli gambar
    xmin = int(xmin * w)
    xmax = int(xmax * w)
    ymin = int(ymin * h)
    ymax = int(ymax * h)

    xmin, xmax = sorted([xmin, xmax])
    ymin, ymax = sorted([ymin, ymax])

    # Memberikan padding ekstra dan memastikan tidak keluar batas gambar
    xmin = max(0, xmin - padding)
    ymin = max(0, ymin - padding)
    xmax = min(w, xmax + padding)
    ymax = min(h, ymax + padding)

    # Potong Gambar
    cropped = image_rgb[ymin:ymax, xmin:xmax]
    
    bbox = {"xmin": xmin, "ymin": ymin, "xmax": xmax, "ymax": ymax}
    return cropped, bbox