"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, X, Image as ImageIcon, Layout, Info, CheckCircle } from "lucide-react";
import Swal from "sweetalert2";

interface Service {
  id: number;
  title: string;
  description: string;
  icon: string | null;
  is_active: boolean;
}

interface ModalServicesProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode: "add" | "edit";
  initialData?: Service | null;
}

export default function ModalServices({ isOpen, onClose, onSuccess, mode, initialData }: ModalServicesProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    is_active: true,
  });
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync data ketika modal dibuka atau data diubah
  useEffect(() => {
    if (mode === "edit" && initialData) {
      setFormData({
        title: initialData.title,
        description: initialData.description || "",
        is_active: Boolean(initialData.is_active),
      });
      setIconPreview(
        initialData.icon 
          ? (initialData.icon.startsWith('http') ? initialData.icon : `http://localhost:8000/storage/${initialData.icon}`) 
          : null
      );
    } else {
      setFormData({ title: "", description: "", is_active: true });
      setIconPreview(null);
    }
    setIconFile(null); 
  }, [mode, initialData, isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIconFile(file);
      setIconPreview(URL.createObjectURL(file));
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

    const submitData = new FormData();
    submitData.append("title", formData.title);
    submitData.append("description", formData.description);
    submitData.append("is_active", formData.is_active ? "1" : "0");
    
    if (iconFile) {
      submitData.append("icon", iconFile);
    }

    if (mode === "edit") {
      submitData.append("_method", "PUT");
    }

    try {
      const url = mode === "add"
        ? "http://localhost:8000/api/services"
        : `http://localhost:8000/api/services/${initialData?.id}`;

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
          text: mode === "add" ? 'Layanan baru berhasil ditambahkan.' : 'Data layanan berhasil diperbarui.',
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
          {/* Header Modal */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02] shrink-0">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              {mode === "add" ? <Plus size={20} className="text-[#FF4F00]"/> : <Edit2 size={20} className="text-blue-500"/>}
              {mode === "add" ? "Tambah Layanan Baru" : "Edit Data Layanan"}
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-rose-500 transition-colors p-1">
              <X size={20} />
            </button>
          </div>

          {/* Body Form Modal */}
          <div className="p-6 overflow-y-auto">
            <form id="servicesForm" onSubmit={handleSubmit} className="space-y-5">
              
              {/* File Image Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Icon / Thumbnail</label>
                <div className="flex items-center gap-4">
                  {iconPreview ? (
                    <div className="w-16 h-16 relative rounded-lg border border-gray-200 dark:border-white/10 overflow-hidden bg-gray-50 flex-shrink-0 p-1">
                      <img src={iconPreview} alt="Preview" className="w-full h-full object-contain" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-lg border border-dashed border-gray-300 dark:border-white/20 bg-gray-50 dark:bg-black/50 flex items-center justify-center text-gray-400 flex-shrink-0">
                      <ImageIcon size={24} />
                    </div>
                  )}
                  <div className="flex-1">
                    <input type="file" accept="image/jpeg, image/png, image/jpg, image/webp, image/svg+xml" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#FF4F00]/10 file:text-[#FF4F00] hover:file:bg-[#FF4F00]/20 transition-colors cursor-pointer focus:outline-none" />
                    {mode === "edit" && <p className="text-xs text-gray-400 mt-2 flex items-center gap-1"><Info size={12} /> Kosongkan jika tidak ingin mengubah icon.</p>}
                  </div>
                </div>
              </div>

              {/* Nama Layanan */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Nama Layanan</label>
                <input 
                  type="text" 
                  required 
                  value={formData.title} 
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
                  className="w-full bg-gray-50 dark:bg-[#121212] border border-gray-200 dark:border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-[#FF4F00] transition-colors text-gray-900 dark:text-white" 
                  placeholder="Contoh: EPC & Konstruksi" 
                />
              </div>

              {/* Deskripsi */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Deskripsi Layanan</label>
                <textarea 
                  rows={4} 
                  required
                  value={formData.description} 
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                  className="w-full bg-gray-50 dark:bg-[#121212] border border-gray-200 dark:border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-[#FF4F00] resize-none text-gray-900 dark:text-white transition-colors" 
                  placeholder="Jelaskan detail dari layanan ini..."
                ></textarea>
              </div>

              {/* Status Aktif Toggle */}
              <div className="bg-gray-50 dark:bg-[#121212] border border-gray-200 dark:border-white/10 p-4 rounded-xl">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-5 h-5 accent-[#FF4F00] rounded cursor-pointer"
                    />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-gray-900 dark:text-white block">Tampilkan ke Publik</span>
                    <span className="text-xs text-gray-500 font-light mt-0.5 block">Layanan ini akan langsung ditampilkan di halaman pengunjung.</span>
                  </div>
                </label>
              </div>

            </form>
          </div>

          {/* Footer Modal */}
          <div className="p-6 border-t border-gray-100 dark:border-white/5 flex justify-end gap-3 shrink-0 bg-gray-50/30 dark:bg-[#1A1A1A]">
            <button type="button" onClick={onClose} className="px-6 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors">Batal</button>
            <button 
              type="submit" 
              form="servicesForm" 
              disabled={isSubmitting} 
              className="px-6 py-2.5 text-sm font-bold text-white bg-[#FF4F00] hover:bg-[#E64600] rounded-lg disabled:opacity-50 transition-colors flex items-center gap-2 shadow-lg shadow-[#FF4F00]/20"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : mode === "add" ? (
                <Plus size={16} />
              ) : (
                <CheckCircle size={16} />
              )}
              {isSubmitting ? "Menyimpan..." : "Simpan Layanan"}
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}