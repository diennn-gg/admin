'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function createCategoryAction(prevState, formData) {
  try {
    const name = formData.get('name')
    const color = formData.get('color')

    if (!name || !color) {
      return { error: 'Vui lòng điền đủ tên và màu sắc.' }
    }

    await db.category.create({
      data: { name, color }
    })

    revalidatePath('/dashboard/categories')
    revalidatePath('/dashboard/expenses')
    return { success: true }
  } catch (error) {
    if (error.code === 'P2002') return { error: 'Tên danh mục đã tồn tại.' }
    return { error: 'Lỗi khi thêm danh mục.' }
  }
}

export async function updateCategoryAction(prevState, formData) {
  try {
    const id = formData.get('id')
    const name = formData.get('name')
    const color = formData.get('color')

    await db.category.update({
      where: { id },
      data: { name, color }
    })

    revalidatePath('/dashboard/categories')
    revalidatePath('/dashboard/expenses')
    return { success: true }
  } catch (error) {
    return { error: 'Lỗi khi cập nhật danh mục.' }
  }
}

export async function deleteCategoryAction(id) {
  try {
    await db.category.delete({
      where: { id }
    })
    
    revalidatePath('/dashboard/categories')
    revalidatePath('/dashboard/expenses')
    return { success: true }
  } catch (error) {
    return { error: 'Không thể xóa vì danh mục đang được sử dụng.' }
  }
}
