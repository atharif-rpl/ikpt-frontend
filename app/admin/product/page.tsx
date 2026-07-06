// ProductListPage.tsx (Document 5)
"use client";

import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Image as ImageIcon, Filter } from "lucide-react";
import Swal from "sweetalert2";
import ProductModal from "./components/ProductModal";

interface Product {
  id: number;
  name: string;
  category: string;
  description: string;
  specs: string | null;
  image: string | null;
}

export default function ProductListPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("Semua");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
        method: "GET",
        headers: { 
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (!res.ok) throw new Error("Gagal mengambil data dari server.");

      const result = await res.json();
      
      if (result.status === "success") {
        setProducts(result.data);
        
        if (activeCategory === "Semua") {
          setFilteredProducts(result.data);
        } else {
          setFilteredProducts(result.data.filter((p: Product) => p.category === activeCategory));
        }
        
        const uniqueCategories = ["Semua", ...new Set(result.data.map((p: Product) => p.category))] as string[];
        setCategories(uniqueCategories);
      } else {
        setError("Gagal mengambil data produk.");
      }
    } catch (err) {
      console.error(err);
      setError("Koneksi ke server backend gagal!");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFilter = (category: string) => {
    setActiveCategory(category);
    if (category === "Semua") {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter(p => p.category === category));
    }
  };

  const handleOpenAdd = () => {
    setModalMode("add");
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setModalMode("edit");
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: 'Hapus Produk?',
      text: "Data akan dihapus permanen dari sistem!",
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`, {
        method: "DELETE",
        headers: { "Accept": "application/json", "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        fetchProducts();
        Swal.fire({ icon: 'success', title: 'Terhapus!', text: 'Produk berhasil dihapus.', timer: 1500, showConfirmButton: false });
      } else {
        Swal.fire('Gagal!', 'Gagal menghapus produk.', 'error');
      }
    } catch (err) {
      Swal.fire('Error!', 'Koneksi server terputus.', 'error');
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto bg-white dark:bg-[#121212] border border-black/5 dark:border-white/5 p-6 sm:p-10 rounded-[32px] shadow-sm">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#FF4F00] font-bold">CMS Control Panel</span>
            <h1 className="text-3xl font-black tracking-tight mt-1 text-gray-900 dark:text-white">Daftar Produk</h1>
            <p className="text-gray-500 text-sm font-medium mt-1">Grup filter otomatis memudahkan pemantauan katalog produk.</p>
          </div>
          <button 
            onClick={handleOpenAdd}
            className="bg-[#FF4F00] hover:bg-[#E64600] text-white font-bold py-3 px-6 rounded-xl text-sm transition-all shadow-lg shadow-[#FF4F00]/20 flex items-center gap-2 hover:scale-105 active:scale-95"
          >
            <Plus size={18} /> Tambah Produk
          </button>
        </div>

        {/* SECTION FILTER KATEGORI */}
        {!isLoading && !error && products.length > 0 && (
          <div className="mb-8 p-6 bg-gray-50 dark:bg-white/[0.02] border border-black/5 dark:border-white/5 rounded-[24px]">
            <div className="flex items-center gap-2 mb-4 text-gray-800 dark:text-gray-200">
              <Filter size={18} className="text-[#FF4F00]" />
              <span className="text-sm font-bold">Filter Kategori Produk</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleFilter(cat)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all ${
                    activeCategory === cat
                      ? "bg-[#FF4F00] text-white shadow-md shadow-[#FF4F00]/20"
                      : "bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* LOADING & ERROR */}
        {isLoading && <div className="text-center py-16"><div className="animate-spin w-10 h-10 border-4 border-gray-100 border-t-[#FF4F00] rounded-full mx-auto"></div><p className="mt-4 text-sm font-medium text-gray-500">Memuat data produk...</p></div>}
        {error && <div className="p-4 mb-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm font-medium text-center">{error}</div>}

        {/* TABEL DATA */}
        {!isLoading && !error && (
          <div className="overflow-x-auto rounded-[24px] border border-black/5 dark:border-white/5">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead className="bg-gray-50/50 dark:bg-white/[0.02]">
                <tr className="text-[11px] uppercase tracking-widest text-gray-400 font-bold">
                  <th className="py-5 px-6 border-b border-black/5 dark:border-white/5">Produk & Deskripsi</th>
                  <th className="py-5 px-6 border-b border-black/5 dark:border-white/5">Kategori</th>
                  <th className="py-5 px-6 border-b border-black/5 dark:border-white/5 hidden md:table-cell">Spesifikasi</th>
                  <th className="py-5 px-6 border-b border-black/5 dark:border-white/5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-16 text-center text-sm text-gray-500 font-medium">Tidak ada produk di kategori ini.</td>
                  </tr>
                ) : (
                  filteredProducts.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors group">
                      
                      {/* KOLOM PRODUK */}
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-xl bg-gray-100 dark:bg-black/40 border border-black/5 dark:border-white/10 overflow-hidden shrink-0 flex items-center justify-center">
                            {item.image ? (
                             <img 
                             src={item.image.startsWith('http') ? item.image : `${process.env.NEXT_PUBLIC_STORAGE_URL}/${item.image}`}
                             className="w-full h-full object-cover"
                             onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/100x100/EEE/31343C?font=Montserrat&text=No+Image' }}
                           />
                            ) : (
                              <ImageIcon className="w-6 h-6 text-gray-400" />
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-sm text-gray-900 dark:text-white max-w-[250px] truncate">{item.name}</span>
                            <span className="text-xs text-gray-500 font-medium mt-0.5 truncate max-w-[250px]">{item.description || "Tidak ada deskripsi"}</span>
                          </div>
                        </div>
                      </td>

                      {/* KOLOM KATEGORI */}
                      <td className="py-5 px-6">
                        <span className="bg-[#FF4F00]/10 text-[#FF4F00] px-3 py-1.5 rounded-lg text-xs font-bold w-fit inline-block">
                          {item.category}
                        </span>
                      </td>

                      {/* KOLOM SPESIFIKASI */}
                      <td className="py-5 px-6 text-sm text-gray-500 dark:text-gray-400 font-medium hidden md:table-cell">
                        <span className="truncate max-w-[200px] block">{item.specs || "-"}</span>
                      </td>

                      {/* KOLOM AKSI */}
                      <td className="py-5 px-6 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleOpenEdit(item)} className="p-2.5 bg-gray-100 dark:bg-white/10 hover:bg-blue-500 hover:text-white rounded-xl transition-all text-gray-500 shadow-sm" title="Edit Produk">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDelete(item.id)} className="p-2.5 bg-gray-100 dark:bg-white/10 hover:bg-rose-500 hover:text-white rounded-xl transition-all text-gray-500 shadow-sm" title="Hapus Produk">
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
      <ProductModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchProducts}
        mode={modalMode}
        initialData={selectedProduct}
      />
    </div>
  );
}