'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Receipt, LogOut, Wallet, Tags, TrendingUp } from 'lucide-react'
import { logoutAction } from './actions'
import styles from './layout.module.css'

export default function DashboardLayout({ children }) {
  const pathname = usePathname()

  return (
    <div className={styles.dashboardLayout}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <Wallet />
          <span>ExpenseAdmin</span>
        </div>
        
        <nav className={styles.sidebarNav}>
          <Link 
            href="/dashboard" 
            className={`${styles.navItem} ${pathname === '/dashboard' ? styles.activeNavItem : ''}`}
          >
            <LayoutDashboard size={20} />
            Tổng quan
          </Link>
          <Link 
            href="/dashboard/expenses" 
            className={`${styles.navItem} ${pathname === '/dashboard/expenses' ? styles.activeNavItem : ''}`}
          >
            <Receipt size={20} />
            Chi tiêu
          </Link>
          <Link 
            href="/dashboard/incomes" 
            className={`${styles.navItem} ${pathname === '/dashboard/incomes' ? styles.activeNavItem : ''}`}
          >
            <TrendingUp size={20} />
            Thu nhập
          </Link>
          <Link 
            href="/dashboard/categories" 
            className={`${styles.navItem} ${pathname === '/dashboard/categories' ? styles.activeNavItem : ''}`}
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
          <div className={styles.headerTitle}>
            {pathname === '/dashboard' ? 'Tổng quan hệ thống' : 
             pathname === '/dashboard/categories' ? 'Quản lý Danh mục' : 
             pathname === '/dashboard/incomes' ? 'Quản lý Thu nhập' : 'Quản lý Chi tiêu'}
          </div>
          <div className={styles.userProfile}>
            <span>Quản trị viên</span>
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
