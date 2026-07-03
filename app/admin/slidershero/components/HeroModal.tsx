"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, X, Image as ImageIcon, Layout, Info } from "lucide-react";
import Swal from "sweetalert2";

interface HeroSlide {
  id: number;
  title: string;
  image: string | null;
}

interface HeroModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode: "add" | "edit";
  initialData?: HeroSlide | null;
}

export default function HeroModal({ isOpen, onClose, onSuccess, mode, initialData }: HeroModalProps) {
  const [formData, setFormData] = useState({
    title: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setFormData({
        title: initialData.title,
      });
      setImagePreview(
        initialData.image 
          ? (initialData.image.startsWith('http') ? initialData.image : `http://localhost:8000/storage/${initialData.image}`) 
          : null
      );
    } else {
      setFormData({ title: "" });
      setImagePreview(null);
    }
    setImageFile(null); 
  }, [mode, initialData, isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire({ icon: 'error', title: 'Akses Ditolak', text: 'Silakan login ulang!' });
      setIsSubmitting(false);
      return;
    }

    if (mode === "add" && !imageFile) {
      Swal.fire({ icon: 'warning', title: 'Oops...', text: 'Gambar Banner Hero wajib diunggah!' });
      setIsSubmitting(false);
      return;
    }

    const submitData = new FormData();
    submitData.append("title", formData.title);
    
    if (imageFile) {
        submitData.append("image", imageFile);
      }
      
      if (mode === "edit") {
        submitData.append("_method", "PUT");
      }
    // Menggunakan POST untuk Add maupun Edit sesuai format backend lu sebelumnya
    try {
      // ENDPOINT SUDAH DIUBAH KE /api/sliders
      const url = mode === "add"
        ? "http://localhost:8000/api/sliders"
        : `http://localhost:8000/api/sliders/${initialData?.id}`;

      const res = await fetch(url, {
        method: "POST", 
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: submitData
      });

      const result = await res.json();
      
      if (res.ok && (result.status === "success" || !result.errors)) {
        onSuccess(); 
        onClose();   
        
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: mode === "add" ? 'Slide hero baru berhasil ditambahkan.' : 'Data banner hero berhasil diperbarui.',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Gagal Menyimpan',
          text: result.message || "Pastikan semua isian form terisi dengan benar.",
          confirmButtonColor: '#FF4F00'
        });
        console.log("Validation Error:", result);
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error Sistem',
        text: "Koneksi ke server backend gagal!",
        confirmButtonColor: '#FF4F00'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-2xl bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02] shrink-0">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              {mode === "add" ? <Plus size={20} className="text-[#FF4F00]"/> : <Edit2 size={20} className="text-blue-500"/>}
              {mode === "add" ? "Tambah Banner Hero Baru" : "Edit Slide Hero"}
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-rose-500 transition-colors p-1">
              <X size={20} />
            </button>
          </div>

          <div className="p-6 overflow-y-auto">
            <form id="heroForm" onSubmit={handleSubmit} className="space-y-5">
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Gambar Banner / Background</label>
                <div className="flex items-center gap-4">
                  {imagePreview ? (
                    <div className="w-28 h-16 relative rounded-lg border border-gray-200 dark:border-white/10 overflow-hidden bg-gray-50 flex-shrink-0">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-28 h-16 rounded-lg border border-dashed border-gray-300 dark:border-white/20 bg-gray-50 dark:bg-black/50 flex items-center justify-center text-gray-400 flex-shrink-0">
                      <ImageIcon size={24} />
                    </div>
                  )}
                  <div className="flex-1">
                    <input type="file" accept="image/jpeg, image/png, image/jpg, image/webp" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#FF4F00]/10 file:text-[#FF4F00] hover:file:bg-[#FF4F00]/20 transition-colors cursor-pointer focus:outline-none" />
                    {mode === "edit" && <p className="text-xs text-gray-400 mt-2 flex items-center gap-1"><Info size={12} /> Kosongkan jika tidak ingin mengubah banner.</p>}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Judul Utama (Title)</label>
                <input 
                  type="text" 
                  required 
                  value={formData.title} 
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
                  className="w-full bg-gray-50 dark:bg-[#121212] border border-gray-200 dark:border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-[#FF4F00] transition-colors text-gray-900 dark:text-white" 
                  placeholder="Contoh: Solusi Konstruksi Terintegrasi" 
                />
              </div>

            </form>
          </div>

          <div className="p-6 border-t border-gray-100 dark:border-white/5 flex justify-end gap-3 shrink-0 bg-gray-50/30 dark:bg-[#1A1A1A]">
            <button type="button" onClick={onClose} className="px-6 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors">Batal</button>
            <button 
              type="submit" 
              form="heroForm" 
              disabled={isSubmitting} 
              className="px-6 py-2.5 text-sm font-bold text-white bg-[#FF4F00] hover:bg-[#E64600] rounded-lg disabled:opacity-50 transition-colors flex items-center gap-2 shadow-lg shadow-[#FF4F00]/20"
            >
              {isSubmitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Layout size={16} />}
              {isSubmitting ? "Menyimpan..." : "Simpan Slider"}
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}