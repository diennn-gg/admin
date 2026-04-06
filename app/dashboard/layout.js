'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Receipt, LogOut, Wallet, Tags, TrendingUp, Menu, X } from 'lucide-react'
import { logoutAction } from './actions'
import styles from './layout.module.css'

export default function DashboardLayout({ children }) {
  const pathname = usePathname()
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false)

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)

  return (
    <div className={styles.dashboardLayout}>
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div className={styles.mobileOverlay} onClick={() => setIsSidebarOpen(false)}></div>
      )}
      
      <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Wallet />
            <span>ExpenseAdmin</span>
          </div>
          <button className={styles.closeSidebarBtn} onClick={() => setIsSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>
        
        <nav className={styles.sidebarNav}>
          <Link 
            href="/dashboard" 
            className={`${styles.navItem} ${pathname === '/dashboard' ? styles.activeNavItem : ''}`}
            onClick={() => setIsSidebarOpen(false)}
          >
            <LayoutDashboard size={20} />
            Tổng quan
          </Link>
          <Link 
            href="/dashboard/expenses" 
            className={`${styles.navItem} ${pathname === '/dashboard/expenses' ? styles.activeNavItem : ''}`}
            onClick={() => setIsSidebarOpen(false)}
          >
            <Receipt size={20} />
            Chi tiêu
          </Link>
          <Link 
            href="/dashboard/incomes" 
            className={`${styles.navItem} ${pathname === '/dashboard/incomes' ? styles.activeNavItem : ''}`}
            onClick={() => setIsSidebarOpen(false)}
          >
            <TrendingUp size={20} />
            Thu nhập
          </Link>
          <Link 
            href="/dashboard/categories" 
            className={`${styles.navItem} ${pathname === '/dashboard/categories' ? styles.activeNavItem : ''}`}
            onClick={() => setIsSidebarOpen(false)}
          >
            <Tags size={20} />
            Danh mục
          </Link>
        </nav>

        <form action={logoutAction}>
          <button type="submit" className={styles.logoutBtn}>
            <LogOut size={20} />
            Đăng xuất
          </button>
        </form>
      </aside>

      <main className={styles.mainContent}>
        <header className={styles.header}>
          <div className={styles.headerTitleGroup}>
            <button className={styles.menuBtn} onClick={toggleSidebar}>
              <Menu size={24} />
            </button>
            <div className={styles.headerTitle}>
              {pathname === '/dashboard' ? 'Tổng quan hệ thống' : 
               pathname === '/dashboard/categories' ? 'Quản lý Danh mục' : 
               pathname === '/dashboard/incomes' ? 'Quản lý Thu nhập' : 'Quản lý Chi tiêu'}
            </div>
          </div>
          <div className={styles.userProfile}>
            <span className={styles.adminText}>Quản trị viên</span>
            <div className={styles.avatar}>A</div>
          </div>
        </header>

        <div className={styles.pageContent}>
          {children}
        </div>
      </main>
    </div>
  )
}
