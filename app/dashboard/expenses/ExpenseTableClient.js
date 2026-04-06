'use client'

import { useState, useTransition } from 'react'
import { Plus, Pencil, Trash2, X, ChevronLeft, ChevronRight, Calendar, Download } from 'lucide-react'
import { useRouter } from 'next/navigation'
import styles from './expenses.module.css'
import { createExpenseAction, updateExpenseAction, deleteExpenseAction } from './actions'

export default function ExpenseTableClient({ expenses, categories = [], pagination, currentMonth }) {
  const router = useRouter()
  const [modalMode, setModalMode] = useState(null) // 'create' | 'edit' | null
  const [currentExpense, setCurrentExpense] = useState(null)
  const [isPending, startTransition] = useTransition()

  const handleMonthChange = (e) => {
    const val = e.target.value
    startTransition(() => {
      router.push(`/dashboard/expenses?page=1${val ? `&month=${val}` : ''}`)
    })
  }

  const handleExport = (type) => {
    let value = ''
    if (type === 'month') {
      if (!currentMonth) {
        alert('Vui lòng chọn tháng trước khi xuất!')
        return
      }
      value = currentMonth
    } else if (type === 'year') {
      const year = currentMonth ? currentMonth.split('-')[0] : new Date().getFullYear()
      value = year
    }
    window.location.href = `/api/export-expenses?type=${type}&value=${value}`
  }


  const handlePageChange = (newPage) => {
    startTransition(() => {
      router.push(`/dashboard/expenses?page=${newPage}${currentMonth ? `&month=${currentMonth}` : ''}`)
    })
  }

  const formatter = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  })

  const openCreateModal = () => {
    setCurrentExpense(null)
    setModalMode('create')
  }

  const openEditModal = (expense) => {
    setCurrentExpense(expense)
    setModalMode('edit')
  }

  const closeModal = () => {
    setModalMode(null)
    setCurrentExpense(null)
  }

  const handleDelete = (id) => {
    if (confirm('Bạn có chắc chắn muốn xóa mục này?')) {
      startTransition(async () => {
        await deleteExpenseAction(id)
      })
    }
  }

  const handleFormAction = async (formData) => {
    startTransition(async () => {
        if (modalMode === 'create') {
            await createExpenseAction(null, formData)
        } else {
            await updateExpenseAction(null, formData)
        }
        closeModal()
    })
  }

  return (
    <>
      <div className={styles.header}>
        <div className={styles.title}>Tất cả Chi tiêu</div>
        
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
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn-secondary" onClick={() => handleExport('month')}>
              <Download size={18} /> Xuất Tháng
            </button>
            <button className="btn-secondary" onClick={() => handleExport('year')}>
              <Download size={18} /> Xuất Năm
            </button>
            <button className="btn-primary" onClick={openCreateModal}>
              <Plus size={18} /> Add New
            </button>
          </div>
        </div>
      </div>

      <div className="glass-panel">
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ minWidth: '100px' }}>Ngày</th>
                <th style={{ minWidth: '180px' }}>Mục chi</th>
                <th style={{ minWidth: '140px' }}>Danh mục</th>
                <th style={{ minWidth: '120px' }}>Số tiền</th>
                <th style={{ width: '120px', minWidth: '120px' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id}>
                  <td>{new Date(expense.date).toLocaleDateString('vi-VN')}</td>
                  <td style={{ fontWeight: 500 }}>{expense.title}</td>
                  <td>
                    <span style={{ 
                        background: `${expense.category?.color || '#3b82f6'}26`, 
                        color: expense.category?.color || '#3b82f6',
                        padding: '0.25rem 0.75rem', 
                        borderRadius: '20px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        border: `1px solid ${expense.category?.color || '#3b82f6'}40`
                      }}>
                        {expense.category?.name || 'Không có'}
                      </span>
                  </td>
                  <td className={styles.amount}>-{formatter.format(expense.amount)}</td>
                  <td>
                    <div className={styles.actionBtns}>
                      <button className="btn-icon" onClick={() => openEditModal(expense)}>
                        <Pencil size={18} />
                      </button>
                      <button className="btn-icon" onClick={() => handleDelete(expense.id)} disabled={isPending}>
                        <Trash2 size={18} color="var(--danger-color)" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {expenses.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                    Chưa có khoản chi tiêu nào. Bấm "Add New" để thêm mới.
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
              <span>{modalMode === 'create' ? 'Thêm Chi tiêu' : 'Chỉnh sửa'}</span>
              <button className="btn-icon" onClick={closeModal}><X /></button>
            </div>
            
            <form action={handleFormAction}>
              {modalMode === 'edit' && <input type="hidden" name="id" value={currentExpense.id} />}
              
              <div className={styles.formGroup}>
                <label>Tên mục chi</label>
                <input 
                  type="text" 
                  name="title" 
                  className="input-base" 
                  defaultValue={currentExpense?.title}
                  required 
                />
              </div>

              <div className={styles.formGroup}>
                <label>Số tiền (VNĐ)</label>
                <input 
                  type="number" 
                  name="amount" 
                  className="input-base" 
                  defaultValue={currentExpense?.amount}
                  required 
                />
              </div>

              <div className={styles.formGroup}>
                <label>Danh mục</label>
                <select 
                  name="categoryId" 
                  className="input-base" 
                  defaultValue={currentExpense?.categoryId || ''} 
                  required
                >
                  <option value="" disabled>--- Chọn danh mục ---</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Ngày</label>
                <input 
                  type="date" 
                  name="date" 
                  className="input-base" 
                  defaultValue={currentExpense?.date 
                    ? new Date(currentExpense.date).toISOString().split('T')[0] 
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
