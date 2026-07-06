// components/ProductModal.tsx (Document 6)
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, X, Image as ImageIcon, Box, Info } from "lucide-react";
import Swal from "sweetalert2";

interface Product {
  id: number;
  name: string;
  category: string;
  description: string;
  specs: string | null;
  image: string | null;
}

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode: "add" | "edit";
  initialData?: Product | null;
}

export default function ProductModal({ isOpen, onClose, onSuccess, mode, initialData }: ProductModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    specs: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync data pas modal dibuka (terutama pas mode edit)
  useEffect(() => {
    if (mode === "edit" && initialData) {
      setFormData({
        name: initialData.name,
        category: initialData.category,
        description: initialData.description || "",
        specs: initialData.specs || "",
      });
      setImagePreview(initialData.image ? `${process.env.NEXT_PUBLIC_STORAGE_URL}/storage/${initialData.image}` : null);
      setFormData({ name: "", category: "", description: "", specs: "" });
      setImagePreview(null);
    }
    setImageFile(null); // Selalu reset file upload tiap buka modal
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

    const submitData = new FormData();
    submitData.append("name", formData.name);
    submitData.append("category", formData.category);
    submitData.append("description", formData.description);
    submitData.append("specs", formData.specs);
    
    if (imageFile) {
      submitData.append("image", imageFile);
    }

    // if (mode === "edit") {
    //   submitData.append("_method", "PUT");
    // }

    try {
      const url = mode === "add"
        ? `${process.env.NEXT_PUBLIC_API_URL}/products`
        : `${process.env.NEXT_PUBLIC_API_URL}/products/${initialData?.id}`;

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: submitData
      });

      const result = await res.json();
      if (result.status === "success" || res.ok) {
        onSuccess(); // Kasih tau list buat refresh data
        onClose();   // Tutup modalnya
        
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: mode === "add" ? 'Produk baru berhasil ditambahkan.' : 'Data produk berhasil diperbarui.',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Gagal Menyimpan',
          text: result.message || "Pastikan form diisi dengan benar.",
          confirmButtonColor: '#FF4F00'
        });
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error Sistem',
        text: "Koneksi ke server terputus.",
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
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02] shrink-0">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              {mode === "add" ? <Plus size={20} className="text-[#FF4F00]"/> : <Edit2 size={20} className="text-blue-500"/>}
              {mode === "add" ? "Tambah Produk Baru" : "Edit Data Produk"}
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-rose-500 transition-colors p-1">
              <X size={20} />
            </button>
          </div>

          {/* Body Modal */}
          <div className="p-6 overflow-y-auto">
            <form id="productForm" onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Foto Produk</label>
                <div className="flex items-center gap-4">
                  {imagePreview ? (
                    <div className="w-20 h-20 relative rounded-lg border border-gray-200 dark:border-white/10 overflow-hidden bg-gray-50 flex-shrink-0">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-lg border border-dashed border-gray-300 dark:border-white/20 bg-gray-50 dark:bg-black/50 flex items-center justify-center text-gray-400 flex-shrink-0">
                      <ImageIcon size={28} />
                    </div>
                  )}
                  <div className="flex-1">
                    <input type="file" accept="image/*" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#FF4F00]/10 file:text-[#FF4F00] hover:file:bg-[#FF4F00]/20 transition-colors cursor-pointer" />
                    {mode === "edit" && <p className="text-xs text-gray-400 mt-2 flex items-center gap-1"><Info size={12} /> Kosongkan jika tidak mengubah foto.</p>}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Nama Produk</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-gray-50 dark:bg-[#121212] border border-gray-200 dark:border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-[#FF4F00] transition-colors text-gray-900 dark:text-white" placeholder="Misal: Gate Valve" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Kategori</label>
                  <input type="text" required value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full bg-gray-50 dark:bg-[#121212] border border-gray-200 dark:border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-[#FF4F00] text-gray-900 dark:text-white" placeholder="Misal: Valve" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Spesifikasi Singkat</label>
                  <input type="text" value={formData.specs} onChange={(e) => setFormData({ ...formData, specs: e.target.value })} className="w-full bg-gray-50 dark:bg-[#121212] border border-gray-200 dark:border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-[#FF4F00] text-gray-900 dark:text-white" placeholder="Misal: Carbon Steel" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Deskripsi Lengkap</label>
                <textarea rows={4} required value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full bg-gray-50 dark:bg-[#121212] border border-gray-200 dark:border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-[#FF4F00] resize-none text-gray-900 dark:text-white" placeholder="Penjelasan detail..."></textarea>
              </div>
            </form>
          </div>

          {/* Footer Modal */}
          <div className="p-6 border-t border-gray-100 dark:border-white/5 flex justify-end gap-3 shrink-0 bg-gray-50/30 dark:bg-[#1A1A1A]">
            <button type="button" onClick={onClose} className="px-6 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors">Batal</button>
            <button type="submit" form="productForm" disabled={isSubmitting} className="px-6 py-2.5 text-sm font-bold text-white bg-[#FF4F00] hover:bg-[#E64600] rounded-lg disabled:opacity-50 transition-colors flex items-center gap-2 shadow-lg shadow-[#FF4F00]/20">
              {isSubmitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Box size={16} />}
              {isSubmitting ? "Menyimpan..." : "Simpan Produk"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}