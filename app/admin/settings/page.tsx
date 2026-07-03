"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Save, Phone, Mail, MapPin, Map, 
  Type, AlignLeft, Globe, Building, BookOpen, Image as ImageIcon, X 
} from "lucide-react";

// --- CUSTOM SVG ICONS (Pengganti Lucide) ---
const InstagramIcon = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
);

const LinkedinIcon = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
);

const YoutubeIcon = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
);

export default function GlobalSettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);

  // State untuk data teks
  const [formData, setFormData] = useState({
    wa_number: "",
    email: "",
    address: "",
    gmaps_link: "",
    instagram: "",
    linkedin: "",
    youtube: "",
    hero_title: "",
    footer_text: "",
    // KOLOM BARU ABOUT
    about_title: "",
    about_description: "",
  });

  // State khusus Gambar About
  const [aboutImageFile, setAboutImageFile] = useState<File | null>(null);
  const [aboutImagePreview, setAboutImagePreview] = useState<string | null>(null);

  // Ambil data pengaturan saat ini dari Laravel
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:8000/api/settings", {
          headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });
        const result = await res.json();

        if (result.status === "success" && result.data) {
          const data = result.data;
          setFormData({
            wa_number: data.wa_number || "",
            email: data.email || "",
            address: data.address || "",
            gmaps_link: data.gmaps_link || "",
            instagram: data.instagram || "",
            linkedin: data.linkedin || "",
            youtube: data.youtube || "",
            hero_title: data.hero_title || "",
            footer_text: data.footer_text || "",
            // KOLOM BARU ABOUT
            about_title: data.about_title || "",
            about_description: data.about_description || "",
          });

          // Set preview gambar lama dari database kalau ada
          if (data.about_image) {
            setAboutImagePreview(`http://localhost:8000/storage/${data.about_image}`);
          }
        }
      } catch (err) {
        console.error("Gagal memuat pengaturan:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handler Input File Gambar About
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAboutImageFile(file);
      setAboutImagePreview(URL.createObjectURL(file)); // Bikin preview lokal langsung
    }
  };

  // Fungsi buat hapus pilihan gambar (reset preview)
  const removeSelectedImage = () => {
    setAboutImageFile(null);
    // Kita nggak hapus preview lama dari DB di sini, cuma reset input file aja
    const input = document.getElementById('about_image') as HTMLInputElement;
    if (input) input.value = '';
    
    // Opsional: Kalau mau preview balik ke gambar DB setelah dihapus, harus ambil lagi dari DB.
    // Tapi mending biarin kosong gini, tandanya user belum milih file baru.
  };

  // SUBMIT DATA (Diubah total pakai FormData)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    // KUNCI UTAMA: Pake FormData karena mau upload gambar
    const submitData = new FormData();
    
    // Loop dan append semua data teks dari formData state
    Object.entries(formData).forEach(([key, value]) => {
      submitData.append(key, value);
    });

    // Append file gambar kalau user milih gambar baru
    if (aboutImageFile) {
      submitData.append("about_image", aboutImageFile);
    }

    try {
      const token = localStorage.getItem("token");
      // Masih pake POST ke endpoint storeLaravel yang pake updateOrCreate id:1
      const res = await fetch("http://localhost:8000/api/settings", {
        method: "POST", 
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
          // JANGAN SET Content-Type manually kalau pakai FormData, biarkan browser yang atur
        },
        body: submitData
      });

      const result = await res.json();

      if (res.ok && result.status === "success") {
        setMessage({ type: "success", text: "Mantap! Pengaturan website berhasil diperbarui." });
        // Reset state file tapi preview biarin (karena gambarnya udah sukses masuk DB)
        setAboutImageFile(null);
        const input = document.getElementById('about_image') as HTMLInputElement;
        if (input) input.value = '';

        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: "error", text: result.message || "Gagal menyimpan pengaturan." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Koneksi ke server gagal!" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-[#FF4F00]">Memuat konfigurasi...</div>;
  }

  return (
    <div className="p-6 md:p-8 w-full max-w-7xl mx-auto min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pengaturan Global</h1>
        <p className="text-gray-500 text-sm mt-1">Konfigurasi informasi kontak, sosial media, dan teks utama website.</p>
      </div>

      {message && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`mb-6 p-4 rounded-xl text-sm font-bold border ${message.type === 'success' ? 'bg-green-500/10 text-green-600 border-green-500/20' : 'bg-rose-500/10 text-rose-600 border-rose-500/20'}`}>
          {message.text}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* CARD BARU: MANAJEMEN HALAMAN ABOUT US */}
        <div className="bg-white dark:bg-[#121212] border border-black/5 dark:border-white/5 rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-black/5 dark:border-white/5">
            <div className="p-2 bg-[#FF4F00]/10 text-[#FF4F00] rounded-lg"><Building size={20} /></div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Konten Halaman About Us</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Sisi Kiri: Upload Gambar */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Foto Perusahaan / Tim (Opsional)</label>
              <div className="flex flex-col gap-4">
                {aboutImagePreview ? (
                  <div className="relative w-full aspect-video rounded-2xl border border-black/10 dark:border-white/10 overflow-hidden bg-gray-50 dark:bg-black/50 group">
                    <img 
                      src={aboutImagePreview} 
                      alt="Preview About Us" 
                      className="w-full h-full object-cover p-2" 
                    />
                    {/* Tombol hapus seleksi baru */}
                    {aboutImageFile && (
                        <button type="button" onClick={removeSelectedImage} className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm p-1.5 rounded-full text-white hover:bg-rose-500 transition-colors opacity-0 group-hover:opacity-100">
                            <X size={16} />
                        </button>
                    )}
                  </div>
                ) : (
                  <div className="w-full aspect-video rounded-2xl border border-dashed border-gray-300 dark:border-white/20 bg-gray-50 dark:bg-black/50 flex items-center justify-center text-gray-400 flex-shrink-0">
                    <ImageIcon size={48} className="opacity-40" />
                  </div>
                )}
                <input 
                    type="file" 
                    id="about_image"
                    accept="image/*" 
                    onChange={handleFileChange} 
                    className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2.5 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-[#FF4F00]/10 file:text-[#FF4F00] hover:file:bg-[#FF4F00]/20 transition-colors cursor-pointer" 
                />
                <p className="text-xs text-gray-500 font-light mt-1">Rekomendasi rasio: 16:9 atau Foto Landscape. Maks 2MB.</p>
              </div>
            </div>

            {/* Sisi Kanan: Judul & Deskripsi */}
            <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Judul Halaman About Us (Misal: Sejarah Kami)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400"><BookOpen size={16} /></div>
                    <input type="text" name="about_title" value={formData.about_title} onChange={handleInputChange} className="w-full bg-gray-50 dark:bg-[#1A1A1A] border border-black/10 dark:border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#FF4F00]" placeholder="Sejarah Perusahaan PT XXX" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Deskripsi Lengkap About Us (Visi, Misi, Sejarah)</label>
                  <div className="relative">
                    <div className="absolute top-3 left-4 pointer-events-none text-gray-400"><AlignLeft size={16} /></div>
                    <textarea name="about_description" rows={10} value={formData.about_description} onChange={handleInputChange} className="w-full bg-gray-50 dark:bg-[#1A1A1A] border border-black/10 dark:border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#FF4F00] transition-colors resize-none custom-scrollbar" placeholder="Berdiri sejak tahun... Visi kami... Misi kami..."></textarea>
                  </div>
                  <p className="text-xs text-gray-500 font-light mt-1">Luas kolom textarea ini responsif, bisa diisi panjang.</p>
                </div>
            </div>
          </div>
        </div>

        {/* CARD 2: INFORMASI KONTAK */}
        <div className="bg-white dark:bg-[#121212] border border-black/5 dark:border-white/5 rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-black/5 dark:border-white/5">
            <div className="p-2 bg-[#FF4F00]/10 text-[#FF4F00] rounded-lg"><Phone size={20} /></div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Informasi Kontak & Lokasi</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Nomor WhatsApp</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400"><Phone size={16} /></div>
                <input type="text" name="wa_number" value={formData.wa_number} onChange={handleInputChange} className="w-full bg-gray-50 dark:bg-[#1A1A1A] border border-black/10 dark:border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#FF4F00] transition-colors" placeholder="6281234567890 (Gunakan awalan 62)" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Alamat Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400"><Mail size={16} /></div>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full bg-gray-50 dark:bg-[#1A1A1A] border border-black/10 dark:border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#FF4F00] transition-colors" placeholder="info@perusahaan.com" />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Alamat Kantor</label>
              <div className="relative">
                <div className="absolute top-3 left-4 pointer-events-none text-gray-400"><MapPin size={16} /></div>
                <textarea name="address" rows={3} value={formData.address} onChange={handleInputChange} className="w-full bg-gray-50 dark:bg-[#1A1A1A] border border-black/10 dark:border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#FF4F00] transition-colors resize-none" placeholder="Alamat lengkap kantor..."></textarea>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Link Google Maps</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400"><Map size={16} /></div>
                <input type="url" name="gmaps_link" value={formData.gmaps_link} onChange={handleInputChange} className="w-full bg-gray-50 dark:bg-[#1A1A1A] border border-black/10 dark:border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#FF4F00] transition-colors" placeholder="https://maps.google.com/..." />
              </div>
            </div>
          </div>
        </div>

        {/* CARD 3: SOCIAL MEDIA */}
        <div className="bg-white dark:bg-[#121212] border border-black/5 dark:border-white/5 rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-black/5 dark:border-white/5">
            <div className="p-2 bg-[#FF4F00]/10 text-[#FF4F00] rounded-lg"><Globe size={20} /></div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Tautan Sosial Media</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">LinkedIn</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400"><LinkedinIcon size={16}/></div>
                <input type="url" name="linkedin" value={formData.linkedin} onChange={handleInputChange} className="w-full bg-gray-50 dark:bg-[#1A1A1A] border border-black/10 dark:border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#FF4F00]" placeholder="URL Profil LinkedIn" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Instagram</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400"><InstagramIcon size={16}/></div>
                <input type="url" name="instagram" value={formData.instagram} onChange={handleInputChange} className="w-full bg-gray-50 dark:bg-[#1A1A1A] border border-black/10 dark:border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#FF4F00]" placeholder="URL Profil Instagram" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">YouTube</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400"><InstagramIcon size={16}/></div>
                <input type="url" name="youtube" value={formData.youtube} onChange={handleInputChange} className="w-full bg-gray-50 dark:bg-[#1A1A1A] border border-black/10 dark:border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#FF4F00]" placeholder="URL Channel YouTube" />
              </div>
            </div>
          </div>
        </div>

        {/* CARD 4: TEKS UTAMA WEB */}
        <div className="bg-white dark:bg-[#121212] border border-black/5 dark:border-white/5 rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-black/5 dark:border-white/5">
            <div className="p-2 bg-[#FF4F00]/10 text-[#FF4F00] rounded-lg"><AlignLeft size={20} /></div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Konten Teks Utama Website</h2>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Judul Utama Halaman Depan (Hero Title)</label>
              <div className="relative">
                <div className="absolute top-3 left-4 pointer-events-none text-gray-400"><Type size={16} /></div>
                <textarea name="hero_title" rows={2} value={formData.hero_title} onChange={handleInputChange} className="w-full bg-gray-50 dark:bg-[#1A1A1A] border border-black/10 dark:border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#FF4F00] resize-none" placeholder="Solusi Engineering Terdepan..."></textarea>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Deskripsi Singkat Footer</label>
              <div className="relative">
                <div className="absolute top-3 left-4 pointer-events-none text-gray-400"><AlignLeft size={16} /></div>
                <textarea name="footer_text" rows={3} value={formData.footer_text} onChange={handleInputChange} className="w-full bg-gray-50 dark:bg-[#1A1A1A] border border-black/10 dark:border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#FF4F00] resize-none" placeholder="PT XXX adalah penyedia solusi..."></textarea>
              </div>
            </div>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="flex justify-end pt-4 pb-12 md:pb-6">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="flex items-center gap-3 bg-[#FF4F00] hover:bg-[#E64600] text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-[#FF4F00]/20 disabled:opacity-50 w-full md:w-auto"
          >
            {isSubmitting ? (
              <span className="animate-pulse">Menyimpan Perubahan...</span>
            ) : (
              <>
                <Save size={18} />
                Simpan Semua Pengaturan
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}