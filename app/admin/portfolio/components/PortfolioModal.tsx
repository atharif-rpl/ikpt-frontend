// components/PortfolioModal.tsx (Document 4)
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, X, Image as ImageIcon, Briefcase, Info, MapPin, User } from "lucide-react";
import Swal from "sweetalert2";

interface Portfolio {
  id: number;
  title: string;
  category: string;
  client: string;
  location_type: string;
  location_name: string;
  desc?: string;
  description?: string; 
  image: string | null;
}

interface PortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode: "add" | "edit";
  initialData?: Portfolio | null;
}

export default function PortfolioModal({ isOpen, onClose, onSuccess, mode, initialData }: PortfolioModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    client: "",
    location_type: "",
    location_name: "",
    desc: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setFormData({
        title: initialData.title,
        category: initialData.category,
        client: initialData.client || "",
        location_type: initialData.location_type || "",
        location_name: initialData.location_name || "",
        desc: initialData.desc || initialData.description || "",
      });
      setImagePreview(initialData.image ? initialData.image : null);
    } else {
      setFormData({ title: "", category: "", client: "", location_type: "", location_name: "", desc: "" });
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
      Swal.fire({ icon: 'warning', title: 'Oops...', text: 'Gambar portofolio wajib diunggah!' });
      setIsSubmitting(false);
      return;
    }

    const submitData = new FormData();
    submitData.append("title", formData.title);
    submitData.append("category", formData.category);
    submitData.append("client", formData.client);
    submitData.append("location_type", formData.location_type); // Bakal ngirim "Lokal" atau "Internasional"
    submitData.append("location_name", formData.location_name);
    submitData.append("desc", formData.desc); // Menggunakan "desc" sesuai Controller lu
    
    if (imageFile) {
      submitData.append("image", imageFile);
    }

    if (mode === "edit") {
      submitData.append("_method", "PUT");
    }

    try {
      const url = mode === "add"
        ? `${process.env.NEXT_PUBLIC_API_URL}/portfolios`
        : `${process.env.NEXT_PUBLIC_API_URL}/portfolios/${initialData?.id}`;

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
          text: mode === "add" ? 'Portofolio baru berhasil dipublish.' : 'Data portofolio berhasil diperbarui.',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Gagal Menyimpan',
          text: result.message || "Pastikan semua isian form valid.",
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
              {mode === "add" ? "Tambah Portofolio Baru" : "Edit Portofolio"}
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-rose-500 transition-colors p-1">
              <X size={20} />
            </button>
          </div>

          <div className="p-6 overflow-y-auto">
            <form id="portfolioForm" onSubmit={handleSubmit} className="space-y-5">
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Gambar Proyek</label>
                <div className="flex items-center gap-4">
                  {imagePreview ? (
                    <div className="w-24 h-16 relative rounded-lg border border-gray-200 dark:border-white/10 overflow-hidden bg-gray-50 flex-shrink-0">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-24 h-16 rounded-lg border border-dashed border-gray-300 dark:border-white/20 bg-gray-50 dark:bg-black/50 flex items-center justify-center text-gray-400 flex-shrink-0">
                      <ImageIcon size={24} />
                    </div>
                  )}
                  <div className="flex-1">
                    <input type="file" accept="image/jpeg, image/png, image/jpg, image/webp" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#FF4F00]/10 file:text-[#FF4F00] hover:file:bg-[#FF4F00]/20 transition-colors cursor-pointer focus:outline-none" />
                    {mode === "edit" && <p className="text-xs text-gray-400 mt-2 flex items-center gap-1"><Info size={12} /> Kosongkan jika tidak mengubah gambar.</p>}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Nama Proyek / Judul</label>
                  <input type="text" required name="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full bg-gray-50 dark:bg-[#121212] border border-gray-200 dark:border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-[#FF4F00] transition-colors text-gray-900 dark:text-white" placeholder="Misal: Pembangunan PLTU" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Nama Klien</label>
                  <div className="relative flex items-center">
                    <User size={18} className="absolute left-4 text-gray-400" />
                    <input type="text" required name="client" value={formData.client} onChange={(e) => setFormData({ ...formData, client: e.target.value })} className="w-full bg-gray-50 dark:bg-[#121212] border border-gray-200 dark:border-white/10 rounded-lg pl-11 pr-4 py-3 focus:outline-none focus:border-[#FF4F00] transition-colors text-gray-900 dark:text-white" placeholder="Misal: PT Pertamina" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="md:col-span-1">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Skala Lokasi</label>
                  <select required name="location_type" value={formData.location_type} onChange={(e) => setFormData({ ...formData, location_type: e.target.value })} className="w-full bg-gray-50 dark:bg-[#121212] border border-gray-200 dark:border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-[#FF4F00] text-gray-900 dark:text-white appearance-none cursor-pointer">
                    <option value="" disabled>Pilih Skala...</option>
                    <option value="Lokal">Lokal</option>
                    <option value="Internasional">Internasional</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Nama Kota / Lokasi</label>
                  <div className="relative flex items-center">
                    <MapPin size={18} className="absolute left-4 text-gray-400" />
                    <input type="text" required name="location_name" value={formData.location_name} onChange={(e) => setFormData({ ...formData, location_name: e.target.value })} className="w-full bg-gray-50 dark:bg-[#121212] border border-gray-200 dark:border-white/10 rounded-lg pl-11 pr-4 py-3 focus:outline-none focus:border-[#FF4F00] transition-colors text-gray-900 dark:text-white" placeholder="Misal: Balikpapan, Kalimantan Timur" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Kategori Proyek</label>
                <input type="text" required name="category" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full bg-gray-50 dark:bg-[#121212] border border-gray-200 dark:border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-[#FF4F00] transition-colors text-gray-900 dark:text-white" placeholder="Misal: EPC / Konstruksi" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Deskripsi Proyek</label>
                <textarea required rows={3} name="desc" value={formData.desc} onChange={(e) => setFormData({ ...formData, desc: e.target.value })} className="w-full bg-gray-50 dark:bg-[#121212] border border-gray-200 dark:border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-[#FF4F00] resize-none text-gray-900 dark:text-white" placeholder="Ceritakan detail proyek ini..."></textarea>
              </div>
            </form>
          </div>

          <div className="p-6 border-t border-gray-100 dark:border-white/5 flex justify-end gap-3 shrink-0 bg-gray-50/30 dark:bg-[#1A1A1A]">
            <button type="button" onClick={onClose} className="px-6 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors">Batal</button>
            <button type="submit" form="portfolioForm" disabled={isSubmitting} className="px-6 py-2.5 text-sm font-bold text-white bg-[#FF4F00] hover:bg-[#E64600] rounded-lg disabled:opacity-50 transition-colors flex items-center gap-2 shadow-lg shadow-[#FF4F00]/20">
              {isSubmitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Briefcase size={16} />}
              {isSubmitting ? "Menyimpan..." : "Simpan Portofolio"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}