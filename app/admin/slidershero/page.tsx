"use client";

import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Image as ImageIcon } from "lucide-react";
import Swal from "sweetalert2";
import HeroModal from "./components/HeroModal";

interface HeroSlide {
  id: number;
  title: string;
  image: string | null;
}

export default function HeroManagementPage() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedSlide, setSelectedSlide] = useState<HeroSlide | null>(null);

  const fetchSlides = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8000/api/sliders", {
        method: "GET",
        headers: { 
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (!res.ok) throw new Error("Gagal mengambil data dari server.");

      const result = await res.json();
      if (result.status === "success" || result.data) {
        setSlides(result.data);
      } else {
        setError("Gagal memuat data hero slider.");
      }
    } catch (err) {
      console.error(err);
      setError("Koneksi ke server backend gagal!");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  const handleOpenAdd = () => {
    setModalMode("add");
    setSelectedSlide(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (slide: HeroSlide) => {
    setModalMode("edit");
    setSelectedSlide(slide);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: 'Hapus Slide Hero?',
      text: "Slider ini akan dihapus permanen dari halaman utama website!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    });

    if (!result.isConfirmed) return;

    Swal.fire({ title: 'Menghapus...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`http://localhost:8000/api/sliders/${id}`, {
        method: "DELETE",
        headers: { 
          "Accept": "application/json",
          "Authorization": `Bearer ${token}` 
        }
      });
      if (res.ok) {
        fetchSlides();
        Swal.fire({ icon: 'success', title: 'Terhapus!', text: 'Slide hero berhasil dihapus.', timer: 1500, showConfirmButton: false });
      } else {
        Swal.fire('Gagal!', 'Gagal menghapus slide hero.', 'error');
      }
    } catch (err) {
      Swal.fire('Error!', 'Koneksi server terputus.', 'error');
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto bg-white dark:bg-[#121212] border border-black/5 dark:border-white/5 p-6 sm:p-10 rounded-[32px] shadow-sm">
        
        {/* TOP HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#FF4F00] font-bold">CMS Control Panel</span>
            <h1 className="text-3xl font-black tracking-tight mt-1 text-gray-900 dark:text-white">Hero Slider Management</h1>
            <p className="text-gray-500 text-sm font-medium mt-1">Kelola gambar banner slider dan judul utama yang tampil di halaman depan.</p>
          </div>
          <button 
            onClick={handleOpenAdd}
            className="bg-[#FF4F00] hover:bg-[#E64600] text-white font-bold py-3 px-6 rounded-xl text-sm transition-all shadow-lg shadow-[#FF4F00]/20 flex items-center gap-2 hover:scale-105 active:scale-95"
          >
            <Plus size={18} /> Tambah Slide
          </button>
        </div>

        {/* LOADING & ERROR STATES */}
        {isLoading && <div className="text-center py-16"><div className="animate-spin w-10 h-10 border-4 border-gray-100 border-t-[#FF4F00] rounded-full mx-auto"></div><p className="mt-4 text-sm font-medium text-gray-500">Memuat data slider...</p></div>}
        {error && <div className="p-4 mb-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm font-medium text-center">{error}</div>}

        {/* TABEL DATA */}
        {!isLoading && !error && (
          <div className="overflow-x-auto rounded-[24px] border border-black/5 dark:border-white/5">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead className="bg-gray-50/50 dark:bg-white/[0.02]">
                <tr className="text-[11px] uppercase tracking-widest text-gray-400 font-bold">
                  <th className="py-5 px-6 border-b border-black/5 dark:border-white/5 w-40">Banner</th>
                  <th className="py-5 px-6 border-b border-black/5 dark:border-white/5">Judul Utama (Title)</th>
                  <th className="py-5 px-6 border-b border-black/5 dark:border-white/5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                {slides.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-16 text-center text-sm text-gray-500 font-medium">Belum ada slide hero yang ditambahkan.</td>
                  </tr>
                ) : (
                  slides.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors group">
                      
                      {/* KOLOM GAMBAR */}
                      <td className="py-5 px-6">
                        <div className="w-28 h-16 rounded-xl bg-gray-100 dark:bg-black/40 border border-black/5 dark:border-white/10 overflow-hidden shrink-0 flex items-center justify-center">
                          {item.image ? (
                            <img 
                              src={item.image.startsWith('http') ? item.image : `http://localhost:8000/storage/${item.image}`} 
                              alt={item.title} 
                              className="w-full h-full object-cover" 
                              onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/120x60/EEE/31343C?font=Montserrat&text=No+Image' }}
                            />
                          ) : (
                            <ImageIcon className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                      </td>

                      {/* KOLOM JUDUL */}
                      <td className="py-5 px-6">
                        <span className="font-bold text-sm text-gray-900 dark:text-white max-w-[300px] truncate block">
                          {item.title || "-"}
                        </span>
                      </td>

                      {/* KOLOM AKSI */}
                      <td className="py-5 px-6 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleOpenEdit(item)} className="p-2.5 bg-gray-100 dark:bg-white/10 hover:bg-blue-500 hover:text-white rounded-xl transition-all text-gray-500 shadow-sm" title="Edit Slide">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDelete(item.id)} className="p-2.5 bg-gray-100 dark:bg-white/10 hover:bg-rose-500 hover:text-white rounded-xl transition-all text-gray-500 shadow-sm" title="Hapus Slide">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* PANGGIL KOMPONEN MODAL DI SINI */}
      <HeroModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchSlides}
        mode={modalMode}
        initialData={selectedSlide}
      />
    </div>
  );
}