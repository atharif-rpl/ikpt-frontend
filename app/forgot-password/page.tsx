"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [step, setStep] = useState(1) // Step 1: Kirim Email, Step 2: Input OTP & Pass Baru
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [password, setPassword] = useState("")

  // Handler Step 1: Minta kode OTP kirim ke Gmail
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      const res = await fetch("http://localhost:8000/api/forgot-password", {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const result = await res.json()

      if (res.ok && result.status === "success") {
        setMessage({ type: "success", text: "Kode OTP berhasil dikirim! Silakan cek kotak masuk Gmail lu." })
        setStep(2) // Lanjut ke langkah masukkan OTP & password baru
      } else {
        setMessage({ type: "error", text: result.message || "Email tidak ditemukan." })
      }
    } catch (err) {
      setMessage({ type: "error", text: "Gagal terhubung ke server auth!" })
    } finally {
      setIsLoading(false)
    }
  }

  // Handler Step 2: Kirim OTP dan Password baru bersamaan ke Laravel
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      const res = await fetch("http://localhost:8000/api/reset-password", {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp, password }),
      })

      const result = await res.json()

      if (res.ok && result.status === "success") {
        setMessage({ type: "success", text: "Password sukses diperbarui! Mengalihkan ke halaman login..." })
        setTimeout(() => {
          router.push("/login")
        }, 2000)
      } else {
        setMessage({ type: "error", text: result.message || "Kode OTP salah atau kedaluwarsa!" })
      }
    } catch (err) {
      setMessage({ type: "error", text: "Gagal memproses reset password!" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#050505] p-6">
      <div className="max-w-sm w-full bg-white dark:bg-[#121212] border border-black/5 dark:border-white/5 rounded-[32px] p-8 shadow-2xl relative overflow-hidden">
        
        <div className="text-center mb-8">
          <span className="text-xs uppercase tracking-widest text-[#FF4F00] font-bold">Security Verification</span>
          <h2 className="text-xl font-bold tracking-tight mt-2 text-gray-900 dark:text-white">
            {step === 1 ? "Aktivasi & Recovery Akun" : "Verifikasi OTP Gmail"}
          </h2>
          <p className="text-gray-400 text-xs mt-1 font-light">
            {step === 1 
              ? "Masukkan Gmail recovery yang didaftarkan oleh Super Admin untuk menerima kode OTP." 
              : "Masukkan 6 digit kode unik yang dikirim ke email lu beserta password baru."}
          </p>
        </div>

        {message && (
          <div className={`p-3 mb-4 rounded-xl text-xs font-semibold border text-center ${
            message.type === "success" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-rose-500/10 border-rose-500/20 text-rose-500"
          }`}>
            {message.text}
          </div>
        )}

        {step === 1 ? (
          /* FORM STEP 1: MINTA OTP */
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5 text-gray-400">Gmail Recovery</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-gray-50 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF4F00]" placeholder="nama_lu@gmail.com" />
            </div>

            <button type="submit" disabled={isLoading} className="w-full bg-[#FF4F00] hover:bg-[#E64600] disabled:bg-gray-600 text-white font-bold py-3.5 px-6 rounded-full text-sm tracking-wide transition-all mt-4">
              {isLoading ? "Mengirim OTP..." : "Minta Kode OTP"}
            </button>
          </form>
        ) : (
          /* FORM STEP 2: INPUT OTP & PASSWORD BARU */
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5 text-gray-400">Kode OTP (6 Digit)</label>
              <input type="text" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value)} required className="w-full bg-gray-50 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF4F00] tracking-[4px] text-center font-bold" placeholder="123456" />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5 text-gray-400">Password Baru Pribadi</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full bg-gray-50 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF4F00]" placeholder="••••••••" />
            </div>

            <button type="submit" disabled={isLoading} className="w-full bg-[#FF4F00] hover:bg-[#E64600] disabled:bg-gray-600 text-white font-bold py-3.5 px-6 rounded-full text-sm tracking-wide transition-all mt-4">
              {isLoading ? "Memproses Verifikasi..." : "Aktivasi & Ganti Password"}
            </button>
          </form>
        )}

        <div className="text-center mt-6">
          <Link href="/login" className="text-xs font-bold text-gray-400 hover:text-[#FF4F00] transition-colors">← Balik ke Login</Link>
        </div>

      </div>
    </div>
  )
}