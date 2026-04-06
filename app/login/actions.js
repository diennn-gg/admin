'use server'

import { db } from '@/lib/db'
import { createSession } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import { redirect } from 'next/navigation'

export async function loginAction(prevState, formData) {
  const username = formData.get('username')
  const password = formData.get('password')

  if (!username || !password) {
    return { error: 'Vui lòng nhập đầy đủ tài khoản và mật khẩu.' }
  }

  const user = await db.user.findUnique({
    where: { username }
  })

  if (!user) {
    return { error: 'Tài khoản không tồn tại.' }
  }

  const passwordMatch = await bcrypt.compare(password, user.password)

  if (!passwordMatch) {
    return { error: 'Mật khẩu không chính xác.' }
  }

  await createSession(user.id)
  redirect('/dashboard')
}
