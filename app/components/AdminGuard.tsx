"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  
  // State untuk nahan render halaman sampai token selesai dicek
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // 1. Cek isi saku (localStorage)
    const token = localStorage.getItem("token");

    // 2. Kalau nggak ada token, tendang ke halaman login
    if (!token) {
      router.replace("/login"); 
    } else {
      // 3. Kalau ada token, silakan masuk
      setIsAuthorized(true);
    }
  }, [pathname, router]);

  // Selama belum dipastikan aman, tampilkan loading screen biar UI asli nggak "bocor" sekilas
  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-[#050505]">
        <div className="animate-spin w-10 h-10 border-4 border-[#FF4F00]/20 border-t-[#FF4F00] rounded-full mb-4"></div>
        <p className="text-gray-500 font-medium animate-pulse">Memverifikasi akses keamanan...</p>
      </div>
    );
  }

  // Kalau aman, render isi dashboard-nya
  return <>{children}</>;
}