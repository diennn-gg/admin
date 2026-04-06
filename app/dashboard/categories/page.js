import { db } from '@/lib/db'
import CategoryClient from './CategoryClient'

export const dynamic = 'force-dynamic'

export default async function CategoriesPage() {
  const categories = await db.category.findMany({
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="animate-fade-in">
      <CategoryClient categories={categories} />
    </div>
  )
}
