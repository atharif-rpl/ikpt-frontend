"use client";

import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Image as ImageIcon, Award } from "lucide-react";
import Swal from "sweetalert2";
import ModalCertificate from "./components/ModalCertificate";

interface Certificate {
  id: number;
  name: string;
  issued_by: string;
  image: string | null;
}

export default function CertificateListPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);

  const fetchCertificates = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8000/api/certificates", {
        method: "GET",
        headers: { 
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (!res.ok) throw new Error("Gagal mengambil data dari server.");

      const result = await res.json();
      
      if (result.status === "success" || result.data) {
        setCertificates(result.data);
      } else {
        setError("Gagal memuat data sertifikat.");
      }
    } catch (err) {
      console.error(err);
      setError("Koneksi ke server backend gagal!");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const handleOpenAdd = () => {
    setModalMode("add");
    setSelectedCertificate(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (certificate: Certificate) => {
    setModalMode("edit");
    setSelectedCertificate(certificate);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: 'Hapus Sertifikat?',
      text: "Data yang dihapus tidak akan tampil lagi di website!",
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
      const res = await fetch(`http://localhost:8000/api/certificates/${id}`, {
        method: "DELETE",
        headers: { "Accept": "application/json", "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        fetchCertificates();
        Swal.fire({ icon: 'success', title: 'Terhapus!', text: 'Sertifikat berhasil dihapus.', timer: 1500, showConfirmButton: false });
      } else {
        Swal.fire('Gagal!', 'Gagal menghapus sertifikat.', 'error');
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
            <h1 className="text-3xl font-black tracking-tight mt-1 text-gray-900 dark:text-white">Manajemen Sertifikat</h1>
            <p className="text-gray-500 text-sm font-medium mt-1">Sertifikat yang diunggah akan tampil di halaman utama web perusahaan.</p>
          </div>
          <button 
            onClick={handleOpenAdd}
            className="bg-[#FF4F00] hover:bg-[#E64600] text-white font-bold py-3 px-6 rounded-xl text-sm transition-all shadow-lg shadow-[#FF4F00]/20 flex items-center gap-2 hover:scale-105 active:scale-95"
          >
            <Plus size={18} /> Unggah Sertifikat
          </button>
        </div>

        {/* LOADING & ERROR STATES */}
        {isLoading && <div className="text-center py-16"><div className="animate-spin w-10 h-10 border-4 border-gray-100 border-t-[#FF4F00] rounded-full mx-auto"></div><p className="mt-4 text-sm font-medium text-gray-500">Memuat data sertifikat...</p></div>}
        {error && <div className="p-4 mb-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm font-medium text-center">{error}</div>}

        {/* TABEL DATA */}
        {!isLoading && !error && (
          <div className="overflow-x-auto rounded-[24px] border border-black/5 dark:border-white/5">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead className="bg-gray-50/50 dark:bg-white/[0.02]">
                <tr className="text-[11px] uppercase tracking-widest text-gray-400 font-bold">
                  <th className="py-5 px-6 border-b border-black/5 dark:border-white/5 w-24">Gambar</th>
                  <th className="py-5 px-6 border-b border-black/5 dark:border-white/5">Nama Sertifikat</th>
                  <th className="py-5 px-6 border-b border-black/5 dark:border-white/5 hidden sm:table-cell">Penerbit</th>
                  <th className="py-5 px-6 border-b border-black/5 dark:border-white/5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                {certificates.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-16 text-center text-sm text-gray-500 font-medium">Belum ada data sertifikat yang diunggah.</td>
                  </tr>
                ) : (
                  certificates.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors group">
                      
                      {/* KOLOM GAMBAR */}
                      <td className="py-5 px-6">
                        <div className="w-20 h-14 rounded-xl bg-gray-100 dark:bg-black/40 border border-black/5 dark:border-white/10 overflow-hidden shrink-0 flex items-center justify-center">
                          {item.image ? (
                            <img 
                              src={item.image.startsWith('http') ? item.image : `http://localhost:8000/storage/${item.image}`} 
                              alt={item.name} 
                              className="w-full h-full object-contain p-1" 
                              onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/100x60/EEE/31343C?font=Montserrat&text=No+Image' }}
                            />
                          ) : (
                            <ImageIcon className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                      </td>

                      {/* KOLOM NAMA */}
                      <td className="py-5 px-6">
                        <span className="font-bold text-sm text-gray-900 dark:text-white max-w-[250px] truncate block">
                          {item.name}
                        </span>
                      </td>

                      {/* KOLOM PENERBIT */}
                      <td className="py-5 px-6 hidden sm:table-cell">
                        <span className="bg-[#FF4F00]/10 text-[#FF4F00] px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 w-fit">
                          <Award size={14} /> {item.issued_by}
                        </span>
                      </td>

                      {/* KOLOM AKSI */}
                      <td className="py-5 px-6 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleOpenEdit(item)} className="p-2.5 bg-gray-100 dark:bg-white/10 hover:bg-blue-500 hover:text-white rounded-xl transition-all text-gray-500 shadow-sm" title="Edit Sertifikat">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDelete(item.id)} className="p-2.5 bg-gray-100 dark:bg-white/10 hover:bg-rose-500 hover:text-white rounded-xl transition-all text-gray-500 shadow-sm" title="Hapus Sertifikat">
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
      <ModalCertificate 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchCertificates}
        mode={modalMode}
        initialData={selectedCertificate}
      />
    </div>
  );
}