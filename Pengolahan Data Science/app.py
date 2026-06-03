import streamlit as st
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

# Config halaman dashboard
st.set_page_config(page_title="Smart Nutrition Scanner - Dashboard", layout="wide")

st.title("🍓 Smart Nutrition Scanner Dashboard")
st.markdown("Aplikasi pemantauan kadar Gula dan Garam pada produk makanan/minuman kemasan untuk mendukung pola hidup sehat.")

# Memuat Dataset yang Sudah Dibersihkan
@st.cache_data
def load_data():
    data = pd.read_csv("Dataset_Gizi_SmartScanner_Cleaned.csv")
    return data

try:
    df = load_data()
    
    # SIDEBAR FILTER
    st.sidebar.header("Filter Produk")
    kategori_pilihan = st.sidebar.multiselect(
        "Pilih Kategori:",
        options=df["Kategori"].unique(),
        default=df["Kategori"].unique()
    )
    
    df_filtered = df[df["Kategori"].isin(kategori_pilihan)]

    # UTAMA: RINGKASAN STATISTIK (METRICS)
    col1, col2, col3 = st.columns(3)
    with col1:
        st.metric("Total Produk Teranalisis", f"{len(df_filtered)} Produk")
    with col2:
        total_tinggi_gula = len(df_filtered[df_filtered["Status_Gula"] == "Tinggi"])
        st.metric("Produk Tinggi Gula (>5g)", f"{total_tinggi_gula} Produk")
    with col3:
        total_tinggi_garam = len(df_filtered[df_filtered["Status_Garam"] == "Tinggi"])
        st.metric("Produk Tinggi Garam (>200mg)", f"{total_tinggi_garam} Produk")

    st.markdown("---")

    # VISUALISASI DATA
    st.subheader("📊 Analisis Distribusi & Pertanyaan Bisnis")
    
    tab1, tab2, tab3, tab4, tab5 = st.tabs([
        "Distribusi Gula", 
        "Komparasi Garam", 
        "Rata-rata Gula Kategori (Q1)", 
        "Rata-rata Garam Kategori (Q2)",
        "10 Produk Paling Sehat (Q3)"
    ])
    
    with tab1:
        fig1, ax1 = plt.subplots(figsize=(10, 4))
        sns.histplot(data=df_filtered, x="Gula_per_sajian (g)", kde=True, color="teal", ax=ax1)
        plt.title("Sebaran Kadar Gula per Sajian")
        st.pyplot(fig1)
        
    with tab2:
        fig2, ax2 = plt.subplots(figsize=(10, 4))
        sns.boxplot(data=df_filtered, x="Kategori", y="Garam_per_sajian (mg)", palette="Set2", ax=ax2)
        plt.axhline(y=200, color="red", linestyle="--", label="Batas Tinggi (200mg)")
        plt.title("Perbandingan Kadar Garam vs Ambang Batas")
        plt.xticks(rotation=45)
        plt.legend()
        st.pyplot(fig2)

    with tab3:
        st.markdown("#### Kategori Produk dengan Rata-rata Kandungan Gula Tertinggi")
        if not df_filtered.empty:
            sugar_analysis = df_filtered.groupby('Kategori')['Gula_per_sajian (g)'].mean().sort_values(ascending=False).reset_index()
            fig3, ax3 = plt.subplots(figsize=(10, 4))
            sns.barplot(data=sugar_analysis, x='Gula_per_sajian (g)', y='Kategori', palette='Reds_r', ax=ax3)
            plt.title('Rata-rata Kandungan Gula per Kategori Produk (Gram)')
            plt.xlabel('Rata-rata Gula (g)')
            plt.ylabel('Kategori Produk')
            st.pyplot(fig3)
        else:
            st.warning("Tidak ada data untuk ditampilkan.")

    with tab4:
        st.markdown("#### Kategori Produk dengan Rata-rata Kandungan Garam Tertinggi")
        if not df_filtered.empty:
            sodium_analysis = df_filtered.groupby('Kategori')['Garam_per_sajian (mg)'].mean().sort_values(ascending=False).reset_index()
            fig4, ax4 = plt.subplots(figsize=(10, 4))
            sns.barplot(data=sodium_analysis, x='Garam_per_sajian (mg)', y='Kategori', palette='Blues_r', ax=ax4)
            plt.title('Rata-rata Kandungan Garam/Natrium per Kategori Produk (mg)')
            plt.xlabel('Rata-rata Natrium (mg)')
            plt.ylabel('Kategori Produk')
            st.pyplot(fig4)
        else:
            st.warning("Tidak ada data untuk ditampilkan.")

    with tab5:
        st.markdown("#### 10 Produk Paling Sehat (Rendah Akumulasi Gula & Garam per 10g)")
        df_normalized = df_filtered.copy()
        if not df_normalized.empty:
            df_normalized['Garam_per_sajian (g)'] = df_normalized['Garam_per_sajian (mg)'] / 1000
            df_normalized['Gula_per_Unit'] = df_normalized['Gula_per_sajian (g)'] / df_normalized['Ukuran_per_Sajian']
            df_normalized['Garam_per_Unit'] = df_normalized['Garam_per_sajian (g)'] / df_normalized['Ukuran_per_Sajian']
            df_normalized['Gula_per_10g'] = df_normalized['Gula_per_Unit'] * 10
            df_normalized['Garam_per_10g'] = df_normalized['Garam_per_Unit'] * 10
            df_normalized['Skor_Sehat_Standard'] = df_normalized['Gula_per_10g'] + df_normalized['Garam_per_10g']
            
            top_10_sehat = df_normalized.sort_values(by='Skor_Sehat_Standard', ascending=True).head(10)
            
            fig5, ax5 = plt.subplots(figsize=(10, 4))
            sns.barplot(data=top_10_sehat, x='Skor_Sehat_Standard', y='Nama_Produk', palette='Greens_r', ax=ax5)
            plt.title('10 Produk Paling Sehat (Standardisasi 10g/mL)')
            plt.xlabel('Skor Gula & Garam per 10g (Semakin Rendah Semakin Sehat)')
            st.pyplot(fig5)
        else:
            st.warning("Tidak ada data untuk ditampilkan.")

    st.markdown("---")

    # TABEL DATA INTERAKTIF
    st.subheader("🔍 Telusuri Kandungan Gizi Produk")
    st.dataframe(
        df_filtered[["Nama_Produk", "Kategori", "Ukuran_per_Sajian", "Gula_per_sajian (g)", "Status_Gula", "Garam_per_sajian (mg)", "Status_Garam"]],
        use_container_width=True
    )

    st.markdown("---")

 
    # KESIMPULAN AKHIR (CONCLUSION)
    st.subheader("📌 Kesimpulan Akhir Analisis Proyek")
    
    with st.expander("Lihat Rangkuman Kesimpulan Bisnis (Click to Expand)", expanded=True):
        st.markdown("""
        1. **Kategori Tinggi Gula:** Klaster **Snack Manis** terdeteksi memiliki kontribusi rata-rata gula tertinggi per sajian dibandingkan kategori lainnya.
        2. **Kategori Tinggi Garam:** Produk **Mie Instan** dan beberapa variasi **Snack Asin** secara konsisten mendominasi ambang batas natrium tinggi. 
        3. **Produk Pilihan Sehat:** Melalui standarisasi bobot acuan 10g, komoditas berlabel *Sugar-Free* atau biskuit diet rendah sodium sukses terisolasi sebagai opsi pangan terbaik.
        4. **Karakteristik Data:** Sebaran data gula membentuk pola *Right-Skewed Distribution*, mengonfirmasi adanya sebagian kecil produk anomali ekstrem yang berisiko tinggi memicu diabetes.
        
        *Insight ini divalidasi sebagai landasan dasar bagi tim AI Engineer dan Fullstack Developer dalam menyusun sistem aturan peringatan gizi pada aplikasi web **Smart Nutrition Scanner**.*
        """)

except Exception as e:
    st.error(f"Gagal memuat data. Error: {e}")