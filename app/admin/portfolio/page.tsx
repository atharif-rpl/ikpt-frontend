// PortfolioListPage.tsx (Document 3)
"use client";

import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Image as ImageIcon, Briefcase, MapPin, User, Filter, RefreshCcw } from "lucide-react";
import Swal from "sweetalert2";
import PortfolioModal from "./components/PortfolioModal";

interface Portfolio {
  id: number;
  title: string;
  category: string;
  client: string;
  location_type: string;
  location_name: string;
  description: string;
  image: string | null;
}

export default function PortfolioListPage() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);

  // State Filter
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [filterRegion, setFilterRegion] = useState<string>(""); 
  const [filterLocationName, setFilterLocationName] = useState<string>("");
  const [filterLocationType, setFilterLocationType] = useState<string>("");

  const fetchPortfolios = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/portfolios`, {
        method: "GET",
        headers: { 
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (!res.ok) throw new Error("Gagal mengambil data dari server.");

      const result = await res.json();
      if (result.status === "success" || result.data) {
        setPortfolios(result.data);
      } else {
        setError("Gagal memuat data portofolio.");
      }
    } catch (err) {
      console.error(err);
      setError("Koneksi ke server backend gagal!");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolios();
  }, []);

  const handleOpenAdd = () => {
    setModalMode("add");
    setSelectedPortfolio(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (portfolio: Portfolio) => {
    setModalMode("edit");
    setSelectedPortfolio(portfolio);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: 'Hapus Portofolio?',
      text: "Data proyek ini akan dihapus permanen dari sistem!",
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/portfolios/${id}`, {
        method: "DELETE",
        headers: { "Accept": "application/json", "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        fetchPortfolios();
        Swal.fire({ icon: 'success', title: 'Terhapus!', text: 'Portofolio berhasil dihapus.', timer: 1500, showConfirmButton: false });
      } else {
        Swal.fire('Gagal!', 'Gagal menghapus portofolio.', 'error');
      }
    } catch (err) {
      Swal.fire('Error!', 'Koneksi server terputus.', 'error');
    }
  };

  // Ekstrak opsi unik untuk dropdown filter
  const uniqueCategories = Array.from(new Set(portfolios.map(p => p.category).filter(Boolean)));
  const uniqueLocationNames = Array.from(new Set(portfolios.map(p => p.location_name).filter(Boolean)));
  const uniqueLocationTypes = Array.from(new Set(portfolios.map(p => p.location_type).filter(Boolean)));

  // Logika Filter
  const filteredData = portfolios.filter((item) => {
    if (filterCategory && item.category !== filterCategory) return false;
    if (filterLocationType && item.location_type !== filterLocationType) return false;
    if (filterLocationName && item.location_name !== filterLocationName) return false;
    return true;
  });

  const resetFilters = () => {
    setFilterCategory("");
    setFilterRegion("");
    setFilterLocationName("");
    setFilterLocationType("");
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto bg-white dark:bg-[#121212] border border-black/5 dark:border-white/5 p-6 sm:p-10 rounded-[32px] shadow-sm">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#FF4F00] font-bold">CMS Control Panel</span>
            <h1 className="text-3xl font-black tracking-tight mt-1 text-gray-900 dark:text-white">Manajemen Portofolio</h1>
            <p className="text-gray-500 text-sm font-medium mt-1">Kelola data rekam jejak proyek perusahaan di sini.</p>
          </div>
          <button 
            onClick={handleOpenAdd}
            className="bg-[#FF4F00] hover:bg-[#E64600] text-white font-bold py-3 px-6 rounded-xl text-sm transition-all shadow-lg shadow-[#FF4F00]/20 flex items-center gap-2 hover:scale-105 active:scale-95"
          >
            <Plus size={18} /> Tambah Proyek
          </button>
        </div>

        {/* SECTION FILTER */}
        {!isLoading && !error && portfolios.length > 0 && (
          <div className="mb-8 p-6 bg-gray-50 dark:bg-white/[0.02] border border-black/5 dark:border-white/5 rounded-[24px]">
            <div className="flex items-center gap-2 mb-4 text-gray-800 dark:text-gray-200">
              <Filter size={18} className="text-[#FF4F00]" />
              <span className="text-sm font-bold">Saring Data Proyek</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              
              <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="w-full bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF4F00] text-gray-700 dark:text-gray-300 font-medium appearance-none cursor-pointer">
                <option value="">Semua Kategori</option>
                {uniqueCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>

              <select value={filterRegion} onChange={(e) => setFilterRegion(e.target.value)} className="w-full bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF4F00] text-gray-700 dark:text-gray-300 font-medium appearance-none cursor-pointer">
                <option value="">Skala (Semua)</option>
                <option value="Nasional">Nasional</option>
                <option value="Internasional">Internasional</option>
              </select>

              <select value={filterLocationName} onChange={(e) => setFilterLocationName(e.target.value)} className="w-full bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF4F00] text-gray-700 dark:text-gray-300 font-medium appearance-none cursor-pointer">
                <option value="">Semua Kota/Lokasi</option>
                {uniqueLocationNames.map(loc => <option key={loc} value={loc}>{loc}</option>)}
              </select>

              <select value={filterLocationType} onChange={(e) => setFilterLocationType(e.target.value)} className="w-full bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF4F00] text-gray-700 dark:text-gray-300 font-medium appearance-none cursor-pointer">
                <option value="">Semua Skala</option>
                {uniqueLocationTypes.map(type => <option key={type} value={type}>{type}</option>)}
              </select>

              <button onClick={resetFilters} className="w-full flex items-center justify-center gap-2 bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 text-gray-700 dark:text-gray-300 font-bold py-3 px-4 rounded-xl text-sm transition-colors">
                <RefreshCcw size={16} /> Reset
              </button>

            </div>
          </div>
        )}

        {/* LOADING & ERROR */}
        {isLoading && <div className="text-center py-16"><div className="animate-spin w-10 h-10 border-4 border-gray-100 border-t-[#FF4F00] rounded-full mx-auto"></div><p className="mt-4 text-sm font-medium text-gray-500">Memuat data portofolio...</p></div>}
        {error && <div className="p-4 mb-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm font-medium text-center">{error}</div>}

        {/* TABEL DATA */}
        {!isLoading && !error && (
          <div className="overflow-x-auto rounded-[24px] border border-black/5 dark:border-white/5">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead className="bg-gray-50/50 dark:bg-white/[0.02]">
                <tr className="text-[11px] uppercase tracking-widest text-gray-400 font-bold">
                  <th className="py-5 px-6 border-b border-black/5 dark:border-white/5">Proyek & Deskripsi</th>
                  <th className="py-5 px-6 border-b border-black/5 dark:border-white/5 hidden md:table-cell">Klien & Lokasi</th>
                  <th className="py-5 px-6 border-b border-black/5 dark:border-white/5 hidden lg:table-cell">Kategori</th>
                  <th className="py-5 px-6 border-b border-black/5 dark:border-white/5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-16 text-center text-sm text-gray-500 font-medium">Tidak ada data yang sesuai dengan filter.</td>
                  </tr>
                ) : (
                  filteredData.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors group">
                      
                      {/* KOLOM PROYEK */}
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-4">
                          <div className="w-20 h-14 rounded-xl bg-gray-100 dark:bg-black/40 border border-black/5 dark:border-white/10 overflow-hidden shrink-0 flex items-center justify-center">
                            {item.image ? (
                             <img 
                             // INI FIX-NYA: Cek apakah item.image udah ada http-nya. Kalau ada, pakai langsung.
                             src={item.image.startsWith('http') ? item.image : `${process.env.NEXT_PUBLIC_STORAGE_URL}/${item.image}`}
                             alt={item.title} 
                             className="w-full h-full object-cover"
                             onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/100x60/EEE/31343C?font=Montserrat&text=No+Image' }}
                           />
                            ) : (
                              <ImageIcon className="w-6 h-6 text-gray-400" />
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-sm text-gray-900 dark:text-white max-w-[250px] truncate">{item.title}</span>
                            <span className="text-xs text-gray-500 font-medium mt-0.5 truncate max-w-[250px]">{item.description || "Tidak ada deskripsi"}</span>
                          </div>
                        </div>
                      </td>

                      {/* KOLOM KLIEN & LOKASI */}
                      <td className="py-5 px-6 hidden md:table-cell">
                        <div className="flex flex-col gap-1.5">
                          <span className="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-300">
                            <User size={14} className="text-[#FF4F00]" /> {item.client || "-"}
                          </span>
                          <span className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                            <MapPin size={14} /> {item.location_name || "-"} <span className="px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-white/10 text-[10px] uppercase tracking-wider">{item.location_type}</span>
                          </span>
                        </div>
                      </td>

                      {/* KOLOM KATEGORI */}
                      <td className="py-5 px-6 hidden lg:table-cell">
                        <span className="bg-[#FF4F00]/10 text-[#FF4F00] px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 w-fit">
                          <Briefcase size={14} /> {item.category}
                        </span>
                      </td>

                      {/* KOLOM AKSI */}
                      <td className="py-5 px-6 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleOpenEdit(item)} className="p-2.5 bg-gray-100 dark:bg-white/10 hover:bg-blue-500 hover:text-white rounded-xl transition-all text-gray-500 shadow-sm" title="Edit Portofolio">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDelete(item.id)} className="p-2.5 bg-gray-100 dark:bg-white/10 hover:bg-rose-500 hover:text-white rounded-xl transition-all text-gray-500 shadow-sm" title="Hapus Portofolio">
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

      <PortfolioModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchPortfolios}
        mode={modalMode}
        initialData={selectedPortfolio}
      />
    </div>
  );
}