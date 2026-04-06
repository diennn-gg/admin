'use client'

import { useActionState } from 'react'
import { Wallet } from 'lucide-react'
import { loginAction } from './actions'
import styles from './login.module.css'

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null)

  return (
    <div className={styles.container}>
      <div className={`glass-panel animate-fade-in ${styles.loginCard}`}>
        <div className={styles.logo}>
          <Wallet size={48} />
        </div>
        
        <h1 className={styles.title}>Expense Admin</h1>
        <p className={styles.subtitle}>Đăng nhập để quản lý hệ thống chi tiêu</p>
        
        {state?.error && (
          <div className={styles.error}>
            {state.error}
          </div>
        )}

        <form className={styles.form} action={formAction}>
          <div className={styles.inputGroup}>
            <label htmlFor="username">Tài khoản</label>
            <input 
              type="text" 
              id="username" 
              name="username" 
              className="input-base" 
              placeholder="admin"
              required 
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label htmlFor="password">Mật khẩu</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              className="input-base" 
              placeholder="••••••••"
              required 
            />
          </div>
          
          <button 
            type="submit" 
            className={`btn-primary ${styles.submitBtn}`}
            disabled={isPending}
          >
            {isPending ? 'Đang xác thực...' : 'Đăng nhập vào hệ thống'}
          </button>
        </form>
      </div>
    </div>
  )
}
