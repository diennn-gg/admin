'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function createExpenseAction(prevState, formData) {
  try {
    const title = formData.get('title')
    const amount = parseFloat(formData.get('amount'))
    const categoryId = formData.get('categoryId')
    const date = new Date(formData.get('date'))

    if (!title || !amount || !categoryId || !date) {
      return { error: 'Vui lòng điền đầy đủ thông tin.' }
    }

    await db.expense.create({
      data: {
        title,
        amount,
        categoryId,
        date
      }
    })

    revalidatePath('/dashboard/expenses')
    revalidatePath('/dashboard')
    
    return { success: true }
  } catch (error) {
    return { error: 'Lỗi khi thêm chi tiêu.' }
  }
}

export async function updateExpenseAction(prevState, formData) {
  try {
    const id = formData.get('id')
    const title = formData.get('title')
    const amount = parseFloat(formData.get('amount'))
    const categoryId = formData.get('categoryId')
    const date = new Date(formData.get('date'))

    await db.expense.update({
      where: { id },
      data: {
        title,
        amount,
        categoryId,
        date
      }
    })

    revalidatePath('/dashboard/expenses')
    revalidatePath('/dashboard')
    
    return { success: true }
  } catch (error) {
    return { error: 'Lỗi khi cập nhật chi tiêu.' }
  }
}

export async function deleteExpenseAction(id) {
  try {
    await db.expense.delete({
      where: { id }
    })
    
    revalidatePath('/dashboard/expenses')
    revalidatePath('/dashboard')
    
    return { success: true }
  } catch (error) {
    return { error: 'Lỗi khi xóa chi tiêu.' }
  }
}
