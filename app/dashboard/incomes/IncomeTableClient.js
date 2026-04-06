'use client'

import { useState, useTransition } from 'react'
import { Plus, Pencil, Trash2, X, ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { useRouter } from 'next/navigation'
import styles from '../expenses/expenses.module.css'
import { createIncomeAction, updateIncomeAction, deleteIncomeAction } from './actions'

export default function IncomeTableClient({ incomes, pagination, currentMonth }) {
  const router = useRouter()
  const [modalMode, setModalMode] = useState(null)
  const [currentIncome, setCurrentIncome] = useState(null)
  const [isPending, startTransition] = useTransition()

  const handleMonthChange = (e) => {
    const val = e.target.value
    startTransition(() => {
      router.push(`/dashboard/incomes?page=1${val ? `&month=${val}` : ''}`)
    })
  }

  const handlePageChange = (newPage) => {
    startTransition(() => {
      router.push(`/dashboard/incomes?page=${newPage}${currentMonth ? `&month=${currentMonth}` : ''}`)
    })
  }

  const formatter = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  })

  const openCreateModal = () => {
    setCurrentIncome(null)
    setModalMode('create')
  }

  const openEditModal = (income) => {
    setCurrentIncome(income)
    setModalMode('edit')
  }

  const closeModal = () => {
    setModalMode(null)
    setCurrentIncome(null)
  }

  const handleDelete = (id) => {
    if (confirm('Bạn có chắc chắn muốn xóa mục này?')) {
      startTransition(async () => {
        await deleteIncomeAction(id)
      })
    }
  }

  const handleFormAction = async (formData) => {
    startTransition(async () => {
        if (modalMode === 'create') {
            await createIncomeAction(null, formData)
        } else {
            await updateIncomeAction(null, formData)
        }
        closeModal()
    })
  }

  return (
    <>
      <div className={styles.header}>
        <div className={styles.title}>Tất cả Thu nhập</div>
        
        <div className={styles.filterBar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={18} color="var(--text-secondary)" />
            <input 
              type="month" 
              className={styles.monthPicker} 
              value={currentMonth} 
              onChange={handleMonthChange}
            />
          </div>
          <button className="btn-primary" onClick={openCreateModal}>
            <Plus size={18} /> Add New
          </button>
        </div>
      </div>

      <div className="glass-panel">
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ minWidth: '100px' }}>Ngày</th>
                <th style={{ minWidth: '180px' }}>Mục thu</th>
                <th style={{ minWidth: '140px' }}>Nguồn thu</th>
                <th style={{ minWidth: '120px' }}>Số tiền</th>
                <th style={{ width: '120px', minWidth: '120px' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {incomes.map((income) => (
                <tr key={income.id}>
                  <td>{new Date(income.date).toLocaleDateString('vi-VN')}</td>
                  <td style={{ fontWeight: 500 }}>{income.title}</td>
                  <td>
                    <span style={{ 
                        background: 'rgba(16, 185, 129, 0.15)', 
                        color: 'var(--success-color)',
                        padding: '0.25rem 0.75rem', 
                        borderRadius: '20px',
                        fontSize: '0.85rem'
                      }}>
                        {income.source}
                      </span>
                  </td>
                  <td className={styles.amount} style={{ color: 'var(--success-color)' }}>+{formatter.format(income.amount)}</td>
                  <td>
                    <div className={styles.actionBtns}>
                      <button className="btn-icon" onClick={() => openEditModal(income)}>
                        <Pencil size={18} />
                      </button>
                      <button className="btn-icon" onClick={() => handleDelete(income.id)} disabled={isPending}>
                        <Trash2 size={18} color="var(--danger-color)" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {incomes.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                    Chưa có khoản thu nhập nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {pagination && (
          <div className={styles.pagination}>
            <div>
              Hiển thị tổng cộng <strong>{pagination.totalRows}</strong> giao dịch
            </div>
            <div className={styles.pageControls}>
              <button 
                className={styles.pageBtn} 
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage <= 1 || isPending}
              >
                <ChevronLeft size={18} />
              </button>
              
              <span style={{ margin: '0 0.5rem' }}>
                Trang {pagination.currentPage} / {pagination.totalPages}
              </span>
              
              <button 
                className={styles.pageBtn} 
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage >= pagination.totalPages || isPending}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {modalMode && (
        <div className={styles.modalOverlay}>
          <div className={`animate-fade-in ${styles.modalContent}`}>
            <div className={styles.modalHeader}>
              <span>{modalMode === 'create' ? 'Thêm Thu nhập' : 'Chỉnh sửa'}</span>
              <button className="btn-icon" onClick={closeModal}><X /></button>
            </div>
            
            <form action={handleFormAction}>
              {modalMode === 'edit' && <input type="hidden" name="id" value={currentIncome.id} />}
              
              <div className={styles.formGroup}>
                <label>Tên khoản thu</label>
                <input 
                  type="text" 
                  name="title" 
                  className="input-base" 
                  defaultValue={currentIncome?.title}
                  required 
                />
              </div>

              <div className={styles.formGroup}>
                <label>Số tiền (VNĐ)</label>
                <input 
                  type="number" 
                  name="amount" 
                  className="input-base" 
                  defaultValue={currentIncome?.amount}
                  required 
                />
              </div>

              <div className={styles.formGroup}>
                <label>Nguồn thu (Ví dụ: Tiền lương, Cổ tức...)</label>
                <input 
                  type="text" 
                  name="source" 
                  className="input-base" 
                  defaultValue={currentIncome?.source} 
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Ngày</label>
                <input 
                  type="date" 
                  name="date" 
                  className="input-base" 
                  defaultValue={currentIncome?.date 
                    ? new Date(currentIncome.date).toISOString().split('T')[0] 
                    : new Date().toISOString().split('T')[0]}
                  required 
                />
              </div>

              <div className={styles.formActions}>
                <button type="button" className="btn-icon" onClick={closeModal}>Hủy</button>
                <button type="submit" className="btn-primary" disabled={isPending}>
                  {isPending ? 'Đang xử lý...' : 'Lưu lại'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
