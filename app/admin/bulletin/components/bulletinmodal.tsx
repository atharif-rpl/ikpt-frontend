"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { X, Image as ImageIcon, Type, User, Save, Upload } from "lucide-react";
import RichTextEditor from "../../../components/RichTextEditor";

interface BulletinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  bulletin: any;
}

export default function BulletinModal({ isOpen, onClose, onSuccess, bulletin }: BulletinModalProps) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (bulletin) {
      setTitle(bulletin.title);
      setAuthor(bulletin.author);
      setContent(bulletin.content);
      // Validasi biar nggak nampilin url "undefined/storage..."
      const storageUrl = process.env.NEXT_PUBLIC_STORAGE_URL || '';
      setImagePreview(bulletin.image ? `${process.env.NEXT_PUBLIC_STORAGE_URL}/${bulletin.image}` : "");
    } else {
      resetForm();
    }
  }, [bulletin, isOpen]);

  const resetForm = () => {
    setTitle("");
    setAuthor("");
    setContent("");
    setImage(null);
    setImagePreview("");
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("author", author);
    formData.append("content", content);
    if (image) {
      formData.append("image", image);
    }

    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      };

      if (bulletin) {
        formData.append('_method', 'PUT');
        await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/bulletins/${bulletin.id}`, formData, config);
        Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Berita berhasil diperbarui.', timer: 1500, showConfirmButton: false });
      } else {
        await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/bulletins`, formData, config);
        Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Berita berhasil ditambahkan.', timer: 1500, showConfirmButton: false });
      }
      
      onSuccess();
      onClose();
      resetForm();
    } catch (error) {
      console.error(error);
      Swal.fire("Error!", "Gagal menyimpan berita. Periksa koneksi atau inputan Anda.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 py-6">
      {/* MODAL CONTAINER */}
      <div className="bg-white dark:bg-[#121212] rounded-[32px] shadow-2xl w-full max-w-4xl max-h-full flex flex-col border border-black/10 dark:border-white/10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* HEADER */}
        <div className="px-8 py-6 border-b border-black/5 dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-white/[0.02]">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#FF4F00] font-bold">Formulir Publikasi</span>
            <h2 className="text-2xl font-black tracking-tight mt-1 text-gray-900 dark:text-white">
              {bulletin ? "Edit Berita" : "Tambah Berita Baru"}
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-2.5 bg-gray-200/50 dark:bg-white/10 hover:bg-rose-500 hover:text-white text-gray-500 rounded-full transition-all"
            title="Tutup Formulir"
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>
        
        {/* BODY / FORM */}
        <div className="overflow-y-auto px-8 py-6 custom-scrollbar">
          <form id="bulletin-form" onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* INPUT JUDUL */}
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Judul Berita</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Type size={16} className="text-gray-400" />
                  </div>
                  <input 
                    type="text" 
                    required 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-[#FF4F00]/50 focus:border-[#FF4F00] dark:text-white transition-all text-sm outline-none"
                    placeholder="Masukkan judul berita yang menarik..." 
                  />
                </div>
              </div>
              
              {/* INPUT PENULIS */}
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Nama Penulis</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User size={16} className="text-gray-400" />
                  </div>
                  <input 
                    type="text" 
                    required 
                    value={author} 
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-[#FF4F00]/50 focus:border-[#FF4F00] dark:text-white transition-all text-sm outline-none"
                    placeholder="Nama lengkap penulis..." 
                  />
                </div>
              </div>
            </div>

            {/* INPUT FOTO COVER (CUSTOM UI) */}
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Foto Cover</label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-5 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl bg-gray-50/50 dark:bg-white/[0.02]">
                {/* Image Preview */}
                <div className="w-full sm:w-40 h-28 shrink-0 bg-gray-100 dark:bg-black/40 rounded-xl border border-black/5 dark:border-white/5 overflow-hidden flex items-center justify-center relative group">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                  )}
                  {/* Overlay pas hover */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <span className="text-white text-xs font-bold">Ganti Foto</span>
                  </div>
                </div>

                {/* Upload Action */}
                <div className="flex-1 w-full">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Unggah gambar baru</p>
                  <p className="text-xs text-gray-500 mb-4">Format yang disarankan: JPG, PNG. Ukuran maksimal 2MB.</p>
                  <div className="relative inline-block w-full sm:w-auto">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                    />
                    <div className="bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 text-gray-700 dark:text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all">
                      <Upload size={16} /> Pilih File
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RICH TEXT EDITOR */}
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Isi Berita</label>
              <div className="border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden focus-within:border-[#FF4F00] focus-within:ring-1 focus-within:ring-[#FF4F00]/50 transition-all">
                <div className="h-[300px] overflow-y-auto bg-gray-50 dark:bg-[#1a1a1a]">
                  <RichTextEditor value={content} onChange={setContent} />
                </div>
              </div>
            </div>

          </form>
        </div>

        {/* FOOTER */}
        <div className="px-8 py-5 border-t border-black/5 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02] flex justify-end gap-3 mt-auto">
          <button 
            type="button" 
            onClick={onClose} 
            className="px-6 py-2.5 rounded-xl font-bold text-gray-600 dark:text-gray-300 bg-gray-200/50 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-all text-sm"
          >
            Batal
          </button>
          <button 
            type="submit" 
            form="bulletin-form"
            disabled={isLoading} 
            className="px-6 py-2.5 rounded-xl font-bold bg-[#FF4F00] text-white hover:bg-[#E64600] disabled:bg-[#FF4F00]/50 disabled:cursor-not-allowed shadow-lg shadow-[#FF4F00]/20 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 text-sm"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Menyimpan...
              </span>
            ) : (
              <>
                <Save size={16} /> Simpan Berita
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}