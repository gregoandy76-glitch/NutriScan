import os
import io
import json
import zipfile
import shutil
import tempfile
import keras
from keras.layers import Dense, InputLayer, Layer


class SafeDense(Dense):
    """Dense dengan __init__ dan from_config yang toleran terhadap quantization_config."""
    def __init__(self, *args, **kwargs):
        kwargs.pop("quantization_config", None)
        super().__init__(*args, **kwargs)

    @classmethod
    def from_config(cls, config):
        config.pop("quantization_config", None)
        return super().from_config(config)


class SafeInputLayer(InputLayer):
    def __init__(self, *args, **kwargs):
        if "batch_shape" in kwargs and "batch_input_shape" not in kwargs:
            kwargs["batch_input_shape"] = kwargs.pop("batch_shape")
        kwargs.pop("optional", None)
        super().__init__(*args, **kwargs)


class SafeLambda(Layer):
    """Layer dummy untuk membuang Lambda bytecode lama yang tidak kompatibel."""
    def __init__(self, **kwargs):
        for key in ["function", "function_type", "arguments", "output_shape", "output_shape_type"]:
            kwargs.pop(key, None)
        super().__init__(**kwargs)

    def call(self, inputs):
        return inputs

    @classmethod
    def from_config(cls, config):
        for key in ["function", "function_type", "arguments", "output_shape", "output_shape_type"]:
            config.pop(key, None)
        return cls(**config)


CUSTOM_OBJECTS = {
    "Dense": SafeDense,
    "InputLayer": SafeInputLayer,
    "Lambda": SafeLambda,
}


def _patch_keras_zip(src_path: str, dst_path: str):
    """
    Buka file .keras (format ZIP), patch semua config.json di dalamnya
    dengan membuang field 'quantization_config', lalu tulis ke dst_path.
    """
    with zipfile.ZipFile(src_path, 'r') as zin:
        buf = io.BytesIO()
        with zipfile.ZipFile(buf, 'w', zipfile.ZIP_DEFLATED) as zout:
            for name in zin.namelist():
                data = zin.read(name)
                if name.endswith('.json'):
                    try:
                        cfg = json.loads(data.decode('utf-8'))
                        _strip_key(cfg, 'quantization_config')
                        data = json.dumps(cfg).encode('utf-8')
                    except Exception:
                        pass  # biarkan data asli jika parse gagal
                zout.writestr(name, data)

    with open(dst_path, 'wb') as f:
        f.write(buf.getvalue())


def _strip_key(obj, key):
    """Hapus key tertentu secara rekursif dari semua dict di dalam struktur JSON."""
    if isinstance(obj, dict):
        obj.pop(key, None)
        for v in obj.values():
            _strip_key(v, key)
    elif isinstance(obj, list):
        for item in obj:
            _strip_key(item, key)


def load_mobile_model(model_path: str):
    """
    Memuat model MobileNet .keras dengan dua strategi:
    1. Load langsung dengan SafeDense custom_objects
    2. Patch ZIP/JSON model lalu load ulang
    """
    if not os.path.exists(model_path):
        print(f"[ERROR] File model tidak ditemukan di: {model_path}")
        return None

    print(f"[INFO] Sedang memuat model dari: {os.path.basename(model_path)} ...")

    # === Strategi 1: Load langsung dengan custom_objects ===
    try:
        model = keras.models.load_model(
            model_path,
            custom_objects=CUSTOM_OBJECTS,
            compile=False,
            safe_mode=False,
        )
        print("[OK] Model berhasil dimuat (strategi 1)")
        return model
    except Exception as e1:
        print(f"[WARN] Strategi 1 gagal: {type(e1).__name__}: {e1}")

    # === Strategi 2: Patch JSON di dalam ZIP lalu load ===
    try:
        print("[INFO] Mencoba strategi 2: patch JSON di dalam file .keras ...")
        with tempfile.TemporaryDirectory() as tmpdir:
            patched = os.path.join(tmpdir, "model_patched.keras")
            _patch_keras_zip(model_path, patched)

            model = keras.models.load_model(
                patched,
                custom_objects=CUSTOM_OBJECTS,
                compile=False,
                safe_mode=False,
            )
        print("[OK] Model berhasil dimuat (strategi 2 - JSON patch)")
        return model
    except Exception as e2:
        print(f"[ERROR] Strategi 2 juga gagal: {type(e2).__name__}: {e2}")
        return None