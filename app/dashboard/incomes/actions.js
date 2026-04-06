'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function createIncomeAction(prevState, formData) {
  try {
    const title = formData.get('title')
    const amount = parseFloat(formData.get('amount'))
    const source = formData.get('source')
    const date = new Date(formData.get('date'))

    if (!title || !amount || !source || !date) {
      return { error: 'Vui lòng điền đầy đủ thông tin.' }
    }

    await db.income.create({
      data: { title, amount, source, date }
    })

    revalidatePath('/dashboard/incomes')
    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    return { error: 'Lỗi khi thêm thu nhập.' }
  }
}

export async function updateIncomeAction(prevState, formData) {
  try {
    const id = formData.get('id')
    const title = formData.get('title')
    const amount = parseFloat(formData.get('amount'))
    const source = formData.get('source')
    const date = new Date(formData.get('date'))

    await db.income.update({
      where: { id },
      data: { title, amount, source, date }
    })

    revalidatePath('/dashboard/incomes')
    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    return { error: 'Lỗi khi cập nhật thu nhập.' }
  }
}

export async function deleteIncomeAction(id) {
  try {
    await db.income.delete({ where: { id } })
    revalidatePath('/dashboard/incomes')
    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    return { error: 'Lỗi khi xóa thu nhập.' }
  }
}
