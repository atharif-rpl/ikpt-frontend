"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link" // <-- Ini wajib ditambahin buat navigasi Next.js

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch("http://localhost:8000/api/login", {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      })

      const result = await res.json()

      if (res.ok && result.status === "success") {
        // Simpan token dan data user ke storage browser
        localStorage.setItem("token", result.token)
        localStorage.setItem("user", JSON.stringify(result.user))
        
        // Terbangkan masuk ke dashboard utama
        router.push("/admin");
      } else {
        setError(result.message || "Email atau password salah.")
      }
    } catch (err) {
      setError("Gagal terhubung ke server auth!")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#050505] p-6">
      <div className="max-w-sm w-full bg-white dark:bg-[#121212] border border-black/5 dark:border-white/5 rounded-[32px] p-8 shadow-2xl relative overflow-hidden">
        
        <div className="text-center mb-8">
          <span className="text-2xl font-black text-[#FF4F00] tracking-tighter">
            IKPT<span className="text-gray-900 dark:text-white font-medium">CMS</span>
          </span>
          <h2 className="text-xl font-bold tracking-tight mt-4 text-gray-900 dark:text-white">Selamat Datang Kembali</h2>
          <p className="text-gray-400 text-xs mt-1 font-light">Masukkan kredensial admin lu untuk membuka akses sistem.</p>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl text-xs font-semibold bg-rose-500/10 border border-rose-500/20 text-rose-500 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5 text-gray-400">Email Address</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full bg-gray-50 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF4F00] text-gray-900 dark:text-white" placeholder="admin@ikpt.com" />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5 text-gray-400">Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required className="w-full bg-gray-50 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF4F00] text-gray-900 dark:text-white" placeholder="••••••••" />
          </div>

          <button type="submit" disabled={isLoading} className="w-full bg-[#FF4F00] hover:bg-[#E64600] disabled:bg-gray-600 text-white font-bold py-3.5 px-6 rounded-full text-sm tracking-wide transition-all mt-4 shadow-lg shadow-[#FF4F00]/10 flex justify-center items-center">
            {isLoading ? "Memvalidasi..." : "Masuk ke Dashboard"}
          </button>
        </form>

        {/* --- TAMBAHAN LINK FORGOT PASSWORD DI SINI --- */}
        <div className="text-center mt-6">
          <Link href="/forgot-password" className="text-xs font-medium text-gray-400 hover:text-[#FF4F00] transition-colors">
            Lupa password atau aktivasi user baru?
          </Link>
        </div>

      </div>
    </div>
  )
}