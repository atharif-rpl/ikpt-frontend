"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Plus, Edit2, Trash2, Image as ImageIcon, User, Calendar, LayoutGrid, List } from "lucide-react";
import BulletinModal from "./components/bulletinmodal";

export default function BulletinManagement() {
  const [bulletins, setBulletins] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBulletin, setSelectedBulletin] = useState<any | null>(null);
  
  // State baru buat nentuin mode tampilan (Default: Card)
  const [viewMode, setViewMode] = useState<"card" | "list">("card");

  const fetchBulletins = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/bulletins`);
      setBulletins(response.data.data);
    } catch (error) {
      console.error("Gagal mengambil data berita", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBulletins();
  }, []);

  const handleOpenModal = (bulletin = null) => {
    setSelectedBulletin(bulletin);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Hapus Berita?",
      text: "Data yang dihapus tidak bisa dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal"
    });

    if (result.isConfirmed) {
      Swal.fire({ title: 'Menghapus...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/bulletins/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        Swal.fire({ icon: 'success', title: 'Terhapus!', text: 'Berita berhasil dihapus.', timer: 1500, showConfirmButton: false });
        fetchBulletins();
      } catch (error) {
        Swal.fire("Error!", "Gagal menghapus berita.", "error");
      }
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto bg-white dark:bg-[#121212] border border-black/5 dark:border-white/5 p-6 sm:p-10 rounded-[32px] shadow-sm">
        
        {/* TOP HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#FF4F00] font-bold">Berita & Publikasi</span>
            <h1 className="text-3xl font-black tracking-tight mt-1 text-gray-900 dark:text-white">Buletin Perusahaan</h1>
            <p className="text-gray-500 text-sm font-medium mt-1">Kelola semua artikel dan update terbaru di sini.</p>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            {/* TOGGLE VIEW MODE */}
            <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-xl">
              <button 
                onClick={() => setViewMode("card")}
                className={`p-2.5 rounded-lg transition-all flex items-center justify-center ${viewMode === 'card' ? 'bg-white dark:bg-[#2a2a2a] text-[#FF4F00] shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                title="Tampilan Kartu"
              >
                <LayoutGrid size={18} />
              </button>
              <button 
                onClick={() => setViewMode("list")}
                className={`p-2.5 rounded-lg transition-all flex items-center justify-center ${viewMode === 'list' ? 'bg-white dark:bg-[#2a2a2a] text-[#FF4F00] shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                title="Tampilan Tabel"
              >
                <List size={18} />
              </button>
            </div>

            <button 
              onClick={() => handleOpenModal()}
              className="bg-[#FF4F00] hover:bg-[#E64600] text-white font-bold py-3 px-6 rounded-xl text-sm transition-all shadow-lg shadow-[#FF4F00]/20 flex items-center gap-2 hover:scale-105 active:scale-95 whitespace-nowrap ml-auto md:ml-0"
            >
              <Plus size={18} /> Tambah
            </button>
          </div>
        </div>

        {/* LOADING STATE */}
        {isLoading && (
          <div className="text-center py-16">
            <div className="animate-spin w-10 h-10 border-4 border-gray-100 border-t-[#FF4F00] rounded-full mx-auto"></div>
            <p className="mt-4 text-sm font-medium text-gray-500">Memuat data berita...</p>
          </div>
        )}

        {!isLoading && bulletins.length === 0 && (
           <div className="py-20 text-center border-2 border-dashed border-gray-200 dark:border-white/10 rounded-3xl">
             <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
               <ImageIcon className="w-8 h-8 text-gray-400" />
             </div>
             <h3 className="text-lg font-bold text-gray-900 dark:text-white">Belum ada berita</h3>
             <p className="text-gray-500 mt-1 mb-6 text-sm">Mulai bagikan informasi terbaru dengan menambahkan berita pertama Anda.</p>
             <button onClick={() => handleOpenModal()} className="text-[#FF4F00] font-bold text-sm hover:underline">
               + Buat Berita Baru
             </button>
           </div>
        )}

        {/* ========================================= */}
        {/* MODE CARD (GRID VIEW) - TAMPILAN SPESIAL  */}
        {/* ========================================= */}
        {!isLoading && bulletins.length > 0 && viewMode === "card" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {bulletins.map((item) => (
              <div key={item.id} className="bg-white dark:bg-white/[0.02] border border-black/5 dark:border-white/5 rounded-[24px] overflow-hidden group hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/20 transition-all duration-300 flex flex-col">
                
                {/* Image Section */}
                <div className="h-48 w-full bg-gray-100 dark:bg-white/5 relative overflow-hidden">
                  {item.image ? (
                    <img 
                    src={item.image.startsWith('http') ? item.image : `${process.env.NEXT_PUBLIC_STORAGE_URL}/${item.image}`}
                      alt={item.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x300/EEE/31343C?font=Montserrat&text=No+Image' }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-10 h-10 text-gray-300 dark:text-gray-600" />
                    </div>
                  )}
                  {/* Badge Tanggal di pojok gambar */}
                  <div className="absolute top-3 right-3 bg-white/90 dark:bg-black/80 backdrop-blur-sm px-3 py-1.5 rounded-lg text-[11px] font-bold text-gray-800 dark:text-gray-200 shadow-sm flex items-center gap-1.5">
                    <Calendar size={12} className="text-[#FF4F00]" />
                    {new Date(item.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-5 flex-1 flex flex-col">
                  <span className="text-[#FF4F00] text-xs font-bold mb-2 flex items-center gap-1.5">
                    <User size={14} /> {item.author}
                  </span>
                  <h3 className="font-bold text-gray-900 dark:text-white text-base leading-tight mb-4 line-clamp-2" title={item.title}>
                    {item.title}
                  </h3>
                  
                  {/* Action Buttons */}
                  <div className="mt-auto pt-4 border-t border-gray-100 dark:border-white/5 flex gap-2">
                    <button onClick={() => handleOpenModal(item)} className="flex-1 flex items-center justify-center gap-2 py-2 bg-gray-50 dark:bg-white/5 hover:bg-blue-500 hover:text-white rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-300 transition-colors">
                      <Edit2 size={14} /> Edit
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="flex-1 flex items-center justify-center gap-2 py-2 bg-gray-50 dark:bg-white/5 hover:bg-rose-500 hover:text-white rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-300 transition-colors">
                      <Trash2 size={14} /> Hapus
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ========================================= */}
        {/* MODE LIST (TABLE VIEW) - TAMPILAN KLASIK  */}
        {/* ========================================= */}
        {!isLoading && bulletins.length > 0 && viewMode === "list" && (
          <div className="overflow-x-auto rounded-[24px] border border-black/5 dark:border-white/5 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead className="bg-gray-50/50 dark:bg-white/[0.02]">
                <tr className="text-[11px] uppercase tracking-widest text-gray-400 font-bold">
                  <th className="py-5 px-6 border-b border-black/5 dark:border-white/5 w-24">Cover</th>
                  <th className="py-5 px-6 border-b border-black/5 dark:border-white/5">Judul Berita</th>
                  <th className="py-5 px-6 border-b border-black/5 dark:border-white/5 hidden sm:table-cell">Penulis</th>
                  <th className="py-5 px-6 border-b border-black/5 dark:border-white/5 hidden md:table-cell">Tanggal</th>
                  <th className="py-5 px-6 border-b border-black/5 dark:border-white/5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                {bulletins.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors group">
                    {/* KOLOM GAMBAR */}
                    <td className="py-5 px-6">
                      <div className="w-20 h-14 rounded-xl bg-gray-100 dark:bg-black/40 border border-black/5 dark:border-white/10 overflow-hidden shrink-0 flex items-center justify-center">
                        {item.image ? (
                          <img 
                          src={item.image.startsWith('http') ? item.image : `${process.env.NEXT_PUBLIC_STORAGE_URL}/${item.image}`}
                            alt="cover" 
                            className="w-full h-full object-cover" 
                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/100x60/EEE/31343C?font=Montserrat&text=No+Image' }}
                          />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                    </td>

                    {/* KOLOM JUDUL */}
                    <td className="py-5 px-6">
                      <span className="font-bold text-sm text-gray-900 dark:text-white max-w-[250px] truncate block" title={item.title}>
                        {item.title}
                      </span>
                    </td>

                    {/* KOLOM PENULIS */}
                    <td className="py-5 px-6 hidden sm:table-cell">
                      <span className="bg-[#FF4F00]/10 text-[#FF4F00] px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 w-fit">
                        <User size={14} /> {item.author}
                      </span>
                    </td>

                    {/* KOLOM TANGGAL */}
                    <td className="py-5 px-6 hidden md:table-cell">
                      <span className="text-gray-500 dark:text-gray-400 text-xs font-medium flex items-center gap-2">
                        <Calendar size={14} />
                        {new Date(item.created_at).toLocaleDateString("id-ID", {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </span>
                    </td>

                    {/* KOLOM AKSI */}
                    <td className="py-5 px-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-100 xl:opacity-0 xl:group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleOpenModal(item)} className="p-2.5 bg-gray-100 dark:bg-white/10 hover:bg-blue-500 hover:text-white rounded-xl transition-all text-gray-500 shadow-sm" title="Edit Berita">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="p-2.5 bg-gray-100 dark:bg-white/10 hover:bg-rose-500 hover:text-white rounded-xl transition-all text-gray-500 shadow-sm" title="Hapus Berita">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL */}
      <BulletinModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchBulletins} 
        bulletin={selectedBulletin} 
      />
    </div>
  );
}