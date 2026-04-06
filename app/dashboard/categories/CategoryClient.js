'use client'

import { useState, useTransition } from 'react'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import { createCategoryAction, updateCategoryAction, deleteCategoryAction } from './actions'
import styles from '../expenses/expenses.module.css' // Tái sử dụng style

export default function CategoryClient({ categories }) {
  const [modalMode, setModalMode] = useState(null)
  const [currentCat, setCurrentCat] = useState(null)
  const [isPending, startTransition] = useTransition()
  const [errorMsg, setErrorMsg] = useState('')

  const openCreateModal = () => {
    setCurrentCat(null)
    setModalMode('create')
    setErrorMsg('')
  }

  const openEditModal = (cat) => {
    setCurrentCat(cat)
    setModalMode('edit')
    setErrorMsg('')
  }

  const closeModal = () => {
    setModalMode(null)
    setCurrentCat(null)
  }

  const handleDelete = (id) => {
    if (confirm('Bạn có chắc chắn muốn xóa danh mục này? Lưu ý sẽ không xóa được nếu đang có khoản chi sử dụng nó.')) {
      startTransition(async () => {
        const res = await deleteCategoryAction(id)
        if (res?.error) alert(res.error)
      })
    }
  }

  const handleFormAction = async (formData) => {
    startTransition(async () => {
        let res;
        if (modalMode === 'create') {
            res = await createCategoryAction(null, formData)
        } else {
            res = await updateCategoryAction(null, formData)
        }
        
        if (res?.error) {
            setErrorMsg(res.error)
        } else {
            closeModal()
        }
    })
  }

  return (
    <>
      <div className={styles.header}>
        <div className={styles.title}>Quản lý Danh mục</div>
        <button className="btn-primary" onClick={openCreateModal}>
          <Plus size={18} /> Add Category
        </button>
      </div>

      <div className="glass-panel">
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Tên danh mục</th>
                <th>Mã màu</th>
                <th style={{ width: '120px' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id}>
                  <td style={{ fontWeight: 500 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ 
                        width: '12px', height: '12px', borderRadius: '50%', backgroundColor: cat.color 
                      }}></span>
                      {cat.name}
                    </div>
                  </td>
                  <td style={{ fontFamily: 'monospace' }}>{cat.color}</td>
                  <td>
                    <div className={styles.actionBtns}>
                      <button className="btn-icon" onClick={() => openEditModal(cat)}>
                        <Pencil size={18} />
                      </button>
                      <button className="btn-icon" onClick={() => handleDelete(cat.id)} disabled={isPending}>
                        <Trash2 size={18} color="var(--danger-color)" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {categories.length === 0 && (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                    Chưa có danh mục nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalMode && (
        <div className={styles.modalOverlay}>
          <div className={`animate-fade-in ${styles.modalContent}`}>
            <div className={styles.modalHeader}>
              <span>{modalMode === 'create' ? 'Tạo Danh mục' : 'Sửa Danh mục'}</span>
              <button className="btn-icon" onClick={closeModal}><X /></button>
            </div>
            
            {errorMsg && <div style={{ color: 'var(--danger-color)', marginBottom: '1rem' }}>{errorMsg}</div>}

            <form action={handleFormAction}>
              {modalMode === 'edit' && <input type="hidden" name="id" value={currentCat.id} />}
              
              <div className={styles.formGroup}>
                <label>Tên danh mục</label>
                <input 
                  type="text" 
                  name="name" 
                  className="input-base" 
                  defaultValue={currentCat?.name}
                  required 
                />
              </div>

              <div className={styles.formGroup}>
                <label>Màu sắc</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <input 
                    type="color" 
                    name="color" 
                    defaultValue={currentCat?.color || '#3b82f6'}
                    required 
                    style={{ 
                        width: '50px', height: '40px', padding: 0, 
                        border: 'none', background: 'transparent', cursor: 'pointer' 
                    }}
                    />
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        (Bấm chọn mã màu đại diện)
                    </span>
                </div>
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
