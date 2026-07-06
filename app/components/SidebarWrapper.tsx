// SidebarWrapper.tsx (Document 13)
"use client"

import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import React, { useEffect, useState } from "react"
import { Images } from "lucide-react"; 

const publicRoutes = ["/login", "/forgot-password"]

export default function SidebarWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  const [userName, setUserName] = useState("Admin")
  const [userRole, setUserRole] = useState("admin")
  const [userPermissions, setUserPermissions] = useState<string[]>([])
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")

    if (!token) {
      if (!publicRoutes.includes(pathname)) {
        router.push("/login")
      } else {
        setIsCheckingAuth(false)
      }
    } else {
      if (publicRoutes.includes(pathname)) {
        router.push("/")
      } else {
        const storedUser = localStorage.getItem("user")
        if (storedUser) {
          const parsed = JSON.parse(storedUser)
          setUserName(parsed.name || "Admin")
          setUserRole(parsed.role || "admin")
          setUserPermissions(parsed.permissions || [])
        }
        setIsCheckingAuth(false)
      }
    }
  }, [pathname, router])

  const handleLogout = async () => {
    const token = localStorage.getItem("token")
    if (!token) return

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/logout`, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        }
      })
    } catch (error) {
      console.error("Gagal koneksi logout ke server")
    } finally {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      router.push("/login")
    }
  }

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#050505]">
        <div className="animate-pulse text-[#FF4F00] font-bold tracking-widest text-xs uppercase">Memverifikasi Akses...</div>
      </div>
    )
  }

  if (publicRoutes.includes(pathname)) {
    return <>{children}</>
  }

  const canAccess = (menuId: string) => {
    if (userRole === "super_admin") return true;
    return userPermissions.includes(menuId);
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-[#050505] font-sans text-gray-900 dark:text-white w-full">
      <aside className="w-64 bg-white dark:bg-[#121212] border-r border-black/5 dark:border-white/5 hidden md:flex flex-col justify-between fixed h-full z-10">
        <div>
          <div className="h-20 flex items-center px-8 border-b border-black/5 dark:border-white/5">
            <span className="text-2xl font-black text-[#FF4F00] tracking-tighter">
              IKPT<span className="text-gray-900 dark:text-white font-medium">CMS</span>
            </span>
          </div>

          <nav className="p-4 space-y-1.5 mt-2 overflow-y-auto max-h-[calc(100vh-160px)] custom-scrollbar">

            <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#FF4F00]/10 text-gray-600 dark:text-gray-400 hover:text-[#FF4F00] transition-colors group">
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
              <span className="text-sm font-semibold">Dashboard Home</span>
            </Link>

            {canAccess("portfolio") && (
              <Link href="/admin/portfolio" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#FF4F00]/10 text-gray-600 dark:text-gray-400 hover:text-[#FF4F00] transition-colors group">
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                <span className="text-sm font-semibold">Data Portfolio</span>
              </Link>
            )}

            {canAccess("certificate") && (
              <Link href="/admin/certificate" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#FF4F00]/10 text-gray-600 dark:text-gray-400 hover:text-[#FF4F00] transition-colors group">
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path></svg>
                <span className="text-sm font-semibold">Kelola Sertifikat</span>
              </Link>
            )}

            {canAccess("product") && (
              <Link href="/admin/product" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#FF4F00]/10 text-gray-600 dark:text-gray-400 hover:text-[#FF4F00] transition-colors group">
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
                <span className="text-sm font-semibold">Kelola Produk</span>
              </Link>
            )}

            {canAccess("service") && (
              <Link href="/admin/services" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#FF4F00]/10 text-gray-600 dark:text-gray-400 hover:text-[#FF4F00] transition-colors group">
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                <span className="text-sm font-semibold">Kelola Layanan</span>
              </Link>
            )}
            {canAccess("settings") && ( // Atau ganti aksesnya sesuai kebutuhan lu
              <Link href="/admin/slidershero" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#FF4F00]/10 text-gray-600 dark:text-gray-400 hover:text-[#FF4F00] transition-colors group">
                <Images className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-semibold">Hero Slider</span>
              </Link>
            )}


            {/* AREA KHUSUS SUPER ADMIN */}
            {userRole === "super_admin" && (
              <div className="pt-4 mt-2 border-t border-black/5 dark:border-white/5 space-y-1.5">

                <Link href="/admin/users" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#FF4F00]/10 text-gray-600 dark:text-gray-400 hover:text-[#FF4F00] transition-colors group">
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                  <span className="text-sm font-semibold">Manajemen User</span>
                </Link>

                {/* MENU PENGATURAN WEB BARU */}
                <Link href="/admin/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#FF4F00]/10 text-gray-600 dark:text-gray-400 hover:text-[#FF4F00] transition-colors group">
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  <span className="text-sm font-semibold">Pengaturan Web</span>
                </Link>

              </div>
            )}
          </nav>
        </div>

        <div className="p-4 border-t border-black/5 dark:border-white/5 bg-gray-50/50 dark:bg-black/20">
          <div className="flex items-center gap-3 px-2 py-2 mb-3">
            <div className="w-9 h-9 rounded-full bg-[#FF4F00] flex items-center justify-center text-white font-bold text-sm shadow-inner">
              {userName.substring(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{userName}</p>
              <p className="text-xs text-gray-500 font-medium truncate uppercase tracking-wider">
                {userRole === "super_admin" ? "Super Admin" : "Administrator"}
              </p>
            </div>
          </div>

          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white transition-all duration-300 text-sm font-bold border border-rose-100 dark:border-rose-500/20">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            Keluar Sistem
          </button>
        </div>
      </aside>

      <main className="flex-1 md:ml-64 relative min-h-screen">
        {children}
      </main>
    </div>
  )
}