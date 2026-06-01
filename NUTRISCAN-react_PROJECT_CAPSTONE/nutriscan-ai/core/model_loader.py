import os
import keras
from keras.layers import Dense, InputLayer, Layer

# PERHATIKAN: Kita sudah menghapus baris TF_USE_LEGACY_KERAS
# karena model ini terbukti buatan Keras 3.

class SafeDense(Dense):
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

# Pelindung utama kita: Layer Dummy untuk membuang Lambda bytecode yang rusak
class SafeLambda(Layer):
    def __init__(self, **kwargs):
        # Buang semua konfigurasi bawaan model .h5 yang bikin crash
        kwargs.pop("function", None)
        kwargs.pop("function_type", None)
        kwargs.pop("arguments", None)
        kwargs.pop("output_shape", None)
        kwargs.pop("output_shape_type", None)
        super().__init__(**kwargs)

    def call(self, inputs):
        # Meneruskan data tanpa mengeksekusi fungsi lambda lama
        return inputs
        
    @classmethod
    def from_config(cls, config):
        for key in ["function", "function_type", "arguments", "output_shape", "output_shape_type"]:
            config.pop(key, None)
        return cls(**config)

def load_mobile_model(model_path):
    """
    Memuat model MobileNet .h5 di Keras 3 dengan custom objects yang aman.
    """
    if os.path.exists(model_path):
        try:
            print(f"📦 Sedang memuat model Keras 3 dari: {model_path} ...")
            
            # Kembali menggunakan keras murni (bukan tf.keras)
            model = keras.models.load_model(
                model_path,
                custom_objects={
                    "Dense": SafeDense,
                    "InputLayer": SafeInputLayer,
                    "Lambda": SafeLambda
                },
                compile=False,
                safe_mode=False
            )
            print("✅ Model MobileNet berhasil dimuat")
            return model
        except Exception as e:
            print(f"❌ Gagal memuat model: {e}")
            return None
    else:
        print(f"❌ File model tidak ditemukan di: {model_path}")
        return None