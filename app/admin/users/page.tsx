"use client"

import { useState, useEffect } from "react"

export default function UserManagementPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  
  // State untuk Daftar User dan Mode Edit
  const [users, setUsers] = useState<any[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)

  const [formData, setFormData] = useState({ name: "", email: "", role: "admin" })
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])

  const availableMenus = [
    { id: "portfolio", label: "Kelola Portfolio" },
    { id: "certificate", label: "Kelola Sertifikat" },
    { id: "product", label: "Kelola Produk" },
  ]

  // Ambil daftar user saat halaman dimuat
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch("http://localhost:8000/api/users", {
        headers: { "Accept": "application/json", "Authorization": `Bearer ${token}` }
      })
      const result = await res.json()
      if (result.status === "success") {
        setUsers(result.data)
      }
    } catch (error) {
      console.error("Gagal mengambil data user")
    } finally {
      setIsFetching(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleCheckboxChange = (menuId: string) => {
    if (selectedPermissions.includes(menuId)) {
      setSelectedPermissions(selectedPermissions.filter(p => p !== menuId))
    } else {
      setSelectedPermissions([...selectedPermissions, menuId])
    }
  }

  // Handle Edit (Klik dari tabel)
  const handleEditClick = (user: any) => {
    setEditingId(user.id)
    setFormData({ name: user.name, email: user.email, role: user.role })
    setSelectedPermissions(user.permissions || [])
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setMessage({ type: "success", text: `Mode Edit diaktifkan untuk: ${user.name}` })
  }

  // Handle Batal Edit
  const handleCancelEdit = () => {
    setEditingId(null)
    setFormData({ name: "", email: "", role: "admin" })
    setSelectedPermissions([])
    setMessage(null)
  }

  // Handle Submit (Create & Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    const token = localStorage.getItem("token")
    const url = editingId ? `http://localhost:8000/api/users/${editingId}` : "http://localhost:8000/api/users"
    const method = editingId ? "PUT" : "POST"

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ ...formData, permissions: selectedPermissions }),
      })

      const result = await response.json()

      if (response.ok && result.status === "success") {
        setMessage({ type: "success", text: editingId ? "Data user berhasil diperbarui!" : "User baru berhasil didaftarkan! OTP siap dikirim." })
        handleCancelEdit() // Reset form
        fetchUsers() // Refresh tabel
      } else {
        setMessage({ type: "error", text: result.message || "Terjadi kesalahan." })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Koneksi ke server backend gagal!" })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle Delete
  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Yakin ingin menghapus akses untuk ${name}? Semua data loginnya akan dicabut secara permanen.`)) return

    const token = localStorage.getItem("token")
    try {
      const response = await fetch(`http://localhost:8000/api/users/${id}`, {
        method: "DELETE",
        headers: { "Accept": "application/json", "Authorization": `Bearer ${token}` }
      })
      const result = await response.json()
      
      if (response.ok) {
        setMessage({ type: "success", text: "User berhasil dihapus dari sistem." })
        fetchUsers() // Refresh tabel
      } else {
        setMessage({ type: "error", text: result.message || "Gagal menghapus user." })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Koneksi ke server gagal!" })
    }
  }

  return (
    <div className="min-h-screen py-10 px-6 max-w-6xl mx-auto space-y-8">
      
      {/* HEADER */}
      <div>
        <span className="text-xs uppercase tracking-widest text-[#FF4F00] font-bold bg-[#FF4F00]/10 px-3 py-1.5 rounded-full">Super Admin Authority</span>
        <h1 className="text-3xl font-black tracking-tight mt-4 text-gray-900 dark:text-white">Manajemen Pengguna</h1>
        <p className="text-gray-500 text-sm mt-1">Atur hak akses, daftarkan anggota baru, dan kelola keamanan sistem.</p>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl text-sm font-bold border flex items-center justify-between ${
          message.type === "success" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-rose-500/10 border-rose-500/20 text-rose-500"
        }`}>
          {message.text}
          <button onClick={() => setMessage(null)} className="opacity-50 hover:opacity-100">✕</button>
        </div>
      )}

      {/* FORM SECTION (Grid Layout biar elegan) */}
      <div className="bg-white dark:bg-[#121212] border border-black/5 dark:border-white/5 p-8 rounded-[32px] shadow-sm relative overflow-hidden">
        <h2 className="text-xl font-black mb-6">{editingId ? "Ubah Data Pengguna" : "Daftarkan Pengguna Baru"}</h2>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider mb-2 text-gray-400">Nama Lengkap</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full bg-gray-50 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF4F00] transition-colors" placeholder="John Doe" />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider mb-2 text-gray-400">Gmail Recovery Utama</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required disabled={!!editingId} className="w-full bg-gray-50 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF4F00] disabled:opacity-50 transition-colors" placeholder="johndoe@gmail.com" />
              {editingId && <p className="text-[10px] text-gray-400 mt-1">*Email tidak bisa diubah setelah didaftarkan.</p>}
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider mb-2 text-gray-400">Role Tingkatan</label>
              <select name="role" value={formData.role} onChange={handleChange} className="w-full bg-gray-50 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF4F00] transition-colors">
                <option value="admin">Admin Biasa (Terbatas)</option>
                <option value="super_admin">Super Admin (Akses Penuh)</option>
              </select>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-5 bg-gray-50 dark:bg-black/20 rounded-2xl border border-black/5 dark:border-white/5 h-full flex flex-col">
              <label className="block text-[10px] font-bold uppercase tracking-wider mb-4 text-gray-400">Hak Akses Fitur (Hanya untuk Admin Biasa)</label>
              <div className="space-y-4 flex-1">
                {availableMenus.map((menu) => (
                  <label key={menu.id} className={`flex items-center gap-3 cursor-pointer group p-3 rounded-xl border transition-all ${selectedPermissions.includes(menu.id) ? 'bg-[#FF4F00]/5 border-[#FF4F00]/20' : 'border-transparent hover:bg-black/5 dark:hover:bg-white/5'}`}>
                    <input 
                      type="checkbox" 
                      checked={selectedPermissions.includes(menu.id)} 
                      onChange={() => handleCheckboxChange(menu.id)}
                      disabled={formData.role === 'super_admin'}
                      className="w-4 h-4 rounded border-gray-300 text-[#FF4F00] focus:ring-[#FF4F00] accent-[#FF4F00]" 
                    />
                    <span className={`text-sm font-bold ${formData.role === 'super_admin' ? 'text-gray-400' : 'text-gray-700 dark:text-gray-200'}`}>{menu.label}</span>
                  </label>
                ))}
              </div>
              
              <div className="flex gap-3 mt-6">
                {editingId && (
                  <button type="button" onClick={handleCancelEdit} className="flex-1 bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 text-gray-900 dark:text-white font-bold py-3.5 px-6 rounded-full text-sm transition-colors">
                    Batal
                  </button>
                )}
                <button type="submit" disabled={isLoading} className={`flex-[2] text-white font-bold py-3.5 px-6 rounded-full text-sm tracking-wide transition-all shadow-lg ${editingId ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20' : 'bg-[#FF4F00] hover:bg-[#E64600] shadow-[#FF4F00]/20'} disabled:bg-gray-600`}>
                  {isLoading ? "Memproses..." : editingId ? "Simpan Perubahan" : "Sah-kan Pengguna"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white dark:bg-[#121212] border border-black/5 dark:border-white/5 rounded-[32px] shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 border-b border-black/5 dark:border-white/5">
          <h2 className="text-xl font-black">Daftar Pengguna Aktif</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-black/20 text-[10px] uppercase tracking-widest text-gray-400">
                <th className="p-4 pl-8 font-bold">Nama / Email</th>
                <th className="p-4 font-bold">Role</th>
                <th className="p-4 font-bold">Akses Fitur</th>
                <th className="p-4 pr-8 font-bold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-black/5 dark:divide-white/5">
              {isFetching ? (
                <tr><td colSpan={4} className="p-8 text-center text-gray-500 animate-pulse">Memuat data pengguna...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-gray-500">Belum ada pengguna terdaftar.</td></tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors group">
                    <td className="p-4 pl-8">
                      <p className="font-bold text-gray-900 dark:text-white">{u.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{u.email}</p>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${u.role === 'super_admin' ? 'bg-[#FF4F00]/10 text-[#FF4F00]' : 'bg-blue-500/10 text-blue-500'}`}>
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4">
                      {u.role === 'super_admin' ? (
                        <span className="text-xs text-gray-400 font-medium italic">Akses Penuh</span>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {u.permissions && u.permissions.length > 0 ? u.permissions.map((p: string, i: number) => (
                            <span key={i} className="px-2 py-0.5 bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 rounded text-[10px] font-bold uppercase">
                              {p}
                            </span>
                          )) : <span className="text-xs text-rose-500">Tidak ada akses</span>}
                        </div>
                      )}
                    </td>
                    <td className="p-4 pr-8 text-right space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEditClick(u)} className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors" title="Edit Data">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                      </button>
                      <button onClick={() => handleDelete(u.id, u.name)} className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors" title="Hapus User">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}