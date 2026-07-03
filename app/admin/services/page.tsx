"use client";

import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, CheckCircle, XCircle, Image as ImageIcon } from "lucide-react";
import Swal from "sweetalert2";
import ModalServices from "./components/modalservices";

interface Service {
  id: number;
  title: string;
  description: string;
  icon: string | null;
  is_active: boolean;
}

export default function ManageServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8000/api/services", {
        method: "GET",
        headers: { 
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (!res.ok) throw new Error("Gagal mengambil data dari server.");

      const result = await res.json();
      if (result.status === "success" || result.data) {
        setServices(result.data);
      } else {
        setError("Gagal memuat data layanan.");
      }
    } catch (err) {
      console.error(err);
      setError("Koneksi ke server backend gagal!");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleOpenAdd = () => {
    setModalMode("add");
    setSelectedService(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (service: Service) => {
    setModalMode("edit");
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: 'Hapus Layanan?',
      text: "Layanan ini akan dihapus permanen dari sistem!",
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
      const res = await fetch(`http://localhost:8000/api/services/${id}`, {
        method: "DELETE",
        headers: { 
          "Accept": "application/json",
          "Authorization": `Bearer ${token}` 
        }
      });
      if (res.ok) {
        fetchServices();
        Swal.fire({ icon: 'success', title: 'Terhapus!', text: 'Layanan berhasil dihapus.', timer: 1500, showConfirmButton: false });
      } else {
        Swal.fire('Gagal!', 'Gagal menghapus layanan.', 'error');
      }
    } catch (err) {
      Swal.fire('Error!', 'Koneksi server terputus.', 'error');
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto bg-white dark:bg-[#121212] border border-black/5 dark:border-white/5 p-6 sm:p-10 rounded-[32px] shadow-sm">
        
        {/* TOP HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#FF4F00] font-bold">CMS Control Panel</span>
            <h1 className="text-3xl font-black tracking-tight mt-1 text-gray-900 dark:text-white">Manajemen Layanan</h1>
            <p className="text-gray-500 text-sm font-medium mt-1">Kelola daftar layanan/services perusahaan yang tampil di web profil.</p>
          </div>
          <button 
            onClick={handleOpenAdd}
            className="bg-[#FF4F00] hover:bg-[#E64600] text-white font-bold py-3 px-6 rounded-xl text-sm transition-all shadow-lg shadow-[#FF4F00]/20 flex items-center gap-2 hover:scale-105 active:scale-95"
          >
            <Plus size={18} /> Tambah Layanan
          </button>
        </div>

        {/* LOADING & ERROR STATES */}
        {isLoading && <div className="text-center py-16"><div className="animate-spin w-10 h-10 border-4 border-gray-100 border-t-[#FF4F00] rounded-full mx-auto"></div><p className="mt-4 text-sm font-medium text-gray-500">Memuat data layanan...</p></div>}
        {error && <div className="p-4 mb-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm font-medium text-center">{error}</div>}

        {/* TABEL DATA */}
        {!isLoading && !error && (
          <div className="overflow-x-auto rounded-[24px] border border-black/5 dark:border-white/5">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead className="bg-gray-50/50 dark:bg-white/[0.02]">
                <tr className="text-[11px] uppercase tracking-widest text-gray-400 font-bold">
                  <th className="py-5 px-6 border-b border-black/5 dark:border-white/5 w-24">Icon</th>
                  <th className="py-5 px-6 border-b border-black/5 dark:border-white/5">Nama Layanan</th>
                  <th className="py-5 px-6 border-b border-black/5 dark:border-white/5 hidden md:table-cell">Deskripsi</th>
                  <th className="py-5 px-6 border-b border-black/5 dark:border-white/5 w-32">Status</th>
                  <th className="py-5 px-6 border-b border-black/5 dark:border-white/5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                {services.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-sm text-gray-500 font-medium">Belum ada layanan yang ditambahkan.</td>
                  </tr>
                ) : (
                  services.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors group">
                      
                      {/* Icon */}
                      <td className="py-5 px-6">
                        <div className="w-14 h-14 rounded-xl bg-gray-100 dark:bg-black/40 border border-black/5 dark:border-white/10 overflow-hidden shrink-0 flex items-center justify-center p-2">
                          {item.icon ? (
                            <img 
                              src={item.icon.startsWith('http') ? item.icon : `http://localhost:8000/storage/${item.icon}`} 
                              alt={item.title} 
                              className="w-full h-full object-contain" 
                              onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/100x100/EEE/31343C?font=Montserrat&text=Icon' }}
                            />
                          ) : (
                            <ImageIcon className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                      </td>

                      {/* Nama Layanan */}
                      <td className="py-5 px-6">
                        <span className="font-bold text-sm text-gray-900 dark:text-white max-w-[250px] truncate block">{item.title}</span>
                      </td>

                      {/* Deskripsi */}
                      <td className="py-5 px-6 hidden md:table-cell">
                        <span className="text-sm text-gray-500 dark:text-gray-400 font-medium truncate max-w-[300px] block">
                          {item.description || "-"}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-5 px-6">
                        {item.is_active ? (
                          <span className="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 w-fit">
                            <CheckCircle size={14} /> Aktif
                          </span>
                        ) : (
                          <span className="bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-gray-400 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 w-fit">
                            <XCircle size={14} /> Nonaktif
                          </span>
                        )}
                      </td>

                      {/* Tombol Aksi */}
                      <td className="py-5 px-6 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleOpenEdit(item)} className="p-2.5 bg-gray-100 dark:bg-white/10 hover:bg-blue-500 hover:text-white rounded-xl transition-all text-gray-500 shadow-sm" title="Edit Layanan">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDelete(item.id)} className="p-2.5 bg-gray-100 dark:bg-white/10 hover:bg-rose-500 hover:text-white rounded-xl transition-all text-gray-500 shadow-sm" title="Hapus Layanan">
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

      {/* PANGGIL KOMPONEN MODAL */}
      <ModalServices 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchServices}
        mode={modalMode}
        initialData={selectedService}
      />
    </div>
  );
}