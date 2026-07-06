"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-[#1a1a1a] border border-black/10 dark:border-white/10 p-4 rounded-2xl shadow-xl z-50 relative">
        <p className="text-sm font-bold text-gray-900 dark:text-white mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-xs font-medium mt-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-gray-500 capitalize">{entry.name}:</span>
            <span className="text-gray-900 dark:text-white font-bold">{entry.value}</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export default function DashboardOverview() {
  const [stats, setStats] = useState({ totalPortfolios: 0, totalCertificates: 0, totalVisits: 0 })
  const [visitorChart, setVisitorChart] = useState<any[]>([]) 
  const [categoryDistribution, setCategoryDistribution] = useState<any[]>([])
  const [user, setUser] = useState({ name: "Admin", role: "admin" })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) setUser(JSON.parse(storedUser))

    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token")
        const headers = { "Accept": "application/json", "Authorization": `Bearer ${token}` }

        const [portRes, certRes, visitorRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/portfolios`, { headers }).then(r => r.json()),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/certificates`, { headers }).then(r => r.json()),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/visitor-stats`, { headers }).then(r => r.json())
        ])

        const portfolios = portRes.status === "success" ? portRes.data : []
        
        // Set Data Cards Utama
        setStats({
          totalPortfolios: portfolios.length,
          totalCertificates: certRes.status === "success" ? certRes.data.length : 0,
          totalVisits: visitorRes.status === "success" ? visitorRes.data.total : 0
        })

        // Set Grafik Area (Kunjungan)
        if (visitorRes.status === "success") {
           setVisitorChart(visitorRes.data.chart)
        }

        // Olah Data Portfolio untuk Pie Chart secara Dinamis
        if (portfolios.length > 0) {
          const categoryCounts = portfolios.reduce((acc: any, curr: any) => {
            const cat = curr.category || 'Lainnya'
            acc[cat] = (acc[cat] || 0) + 1
            return acc
          }, {})

          const colors = ['#FF4F00', '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899']
          const formattedDistribution = Object.keys(categoryCounts).map((key, index) => ({
            name: key,
            value: categoryCounts[key],
            color: colors[index % colors.length]
          }))
          
          setCategoryDistribution(formattedDistribution)
        }

      } catch (error) {
        console.error("Gagal mengambil statistik")
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <div className="p-8 md:p-12 space-y-8 min-h-screen">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#FF4F00] bg-[#FF4F00]/10 px-3 py-1.5 rounded-full">System Overview</span>
          <h1 className="text-3xl md:text-4xl font-black mt-4 tracking-tighter text-gray-900 dark:text-white">Halo, {user.name}!</h1>
          <p className="text-gray-500 text-sm mt-1">Pantau performa dan ringkasan data sistem lu hari ini.</p>
        </div>
        <div className="px-5 py-2.5 bg-white dark:bg-[#121212] rounded-full border border-black/5 dark:border-white/5 shadow-sm">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Akses: <span className="text-[#FF4F00]">{user.role}</span></span>
        </div>
      </div>

      {/* TOP STAT CARDS (Hanya Data Aktif) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: "Total Portfolio", val: stats.totalPortfolios, icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10", color: "text-[#FF4F00]", bg: "bg-[#FF4F00]/10" },
          { label: "Sertifikat Aktif", val: stats.totalCertificates, icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z", color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Kunjungan Web", val: stats.totalVisits, icon: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z", color: "text-blue-500", bg: "bg-blue-500/10" },
        ].map((item, i) => (
          <div key={i} className="bg-white dark:bg-[#121212] p-6 rounded-[24px] border border-black/5 dark:border-white/5 hover:border-[#FF4F00]/20 transition-all shadow-sm relative overflow-hidden group">
            <div className={`w-12 h-12 rounded-2xl ${item.bg} flex items-center justify-center mb-4 ${item.color} group-hover:scale-110 transition-transform`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon}></path></svg>
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{item.label}</p>
            <h3 className="text-3xl font-black mt-1 text-gray-900 dark:text-white">{isLoading ? "..." : item.val}</h3>
          </div>
        ))}
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* AREA CHART: Pertumbuhan Data */}
        <div className="lg:col-span-2 bg-white dark:bg-[#121212] p-6 rounded-[24px] border border-black/5 dark:border-white/5 shadow-sm">
          <div className="mb-6">
            <h3 className="text-lg font-black text-gray-900 dark:text-white">Tren Kunjungan Website</h3>
            <p className="text-xs text-gray-500 mt-1">Statistik trafik berjalan</p>
          </div>
          
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={visitorChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" opacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="kunjungan" name="Kunjungan" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorVisits)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* DONUT CHART: Distribusi Kategori (Dinamis dari Portfolio) */}
        <div className="bg-white dark:bg-[#121212] p-6 rounded-[24px] border border-black/5 dark:border-white/5 shadow-sm flex flex-col">
          <div className="mb-2">
            <h3 className="text-lg font-black text-gray-900 dark:text-white">Kategori Portfolio</h3>
            <p className="text-xs text-gray-500 mt-1">Distribusi pengerjaan proyek berjalan</p>
          </div>
          
          {categoryDistribution.length > 0 ? (
            <>
              <div className="flex-1 min-h-[200px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                      {categoryDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-black text-gray-900 dark:text-white">{stats.totalPortfolios}</span>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Total Proyek</span>
                </div>
              </div>

              <div className="space-y-3 mt-4">
                {categoryDistribution.map((item, i) => (
                  <div key={i} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-gray-600 dark:text-gray-300 font-medium">{item.name}</span>
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white">{item.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center h-[200px]">
              <span className="text-sm text-gray-500">Belum ada data portofolio.</span>
            </div>
          )}
        </div>

      </div>

      {/* QUICK ACTIONS ROW */}
      <div>
        <h2 className="text-sm font-black uppercase tracking-wider text-gray-400 mb-4">Aksi Cepat</h2>
        <div className="flex flex-wrap gap-4">
          <Link href="/admin/portfolio/create" className="px-6 py-3 bg-white dark:bg-[#1a1a1a] border border-black/10 dark:border-white/10 text-gray-900 dark:text-white rounded-xl font-bold text-sm hover:border-[#FF4F00] hover:text-[#FF4F00] transition-colors flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            Tambah Portfolio
          </Link>
          <Link href="/admin/certificate/create" className="px-6 py-3 bg-white dark:bg-[#1a1a1a] border border-black/10 dark:border-white/10 text-gray-900 dark:text-white rounded-xl font-bold text-sm hover:border-emerald-500 hover:text-emerald-500 transition-colors flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
            Unggah Sertifikat
          </Link>
          {user.role === "super_admin" && (
            <Link href="/admin/users" className="px-6 py-3 bg-[#FF4F00] text-white rounded-xl font-bold text-sm hover:bg-[#E64600] transition-colors shadow-lg shadow-[#FF4F00]/20 flex items-center gap-2 ml-auto">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
              Kelola Pengguna
            </Link>
          )}
        </div>
      </div>

    </div>
  )
}