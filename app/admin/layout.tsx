import AdminGuard from '../components/AdminGuard';
import SidebarWrapper from '../components/SidebarWrapper';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // 1. Lapisan terluar admin dijaga sama Guard
    <AdminGuard>
      <div className="flex min-h-screen bg-gray-50 dark:bg-[#050505]">
        
        {/* 2. Sidebar cuma dirender kalau Guard ngasih izin masuk */}
        <SidebarWrapper>
          
          {/* 3. Ini adalah tempat konten halamannya (slidershero, users, dll) */}
          <main className="flex-1 w-full overflow-y-auto">
            {children}
          </main>
          
        </SidebarWrapper>
        
      </div>
    </AdminGuard>
  )
}