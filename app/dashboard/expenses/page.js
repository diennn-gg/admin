import { db } from '@/lib/db'
import ExpenseTableClient from './ExpenseTableClient'

export const dynamic = 'force-dynamic'

export default async function ExpensesPage(props) {
  // Await searchParams in Next.js 15
  const searchParams = await props.searchParams
  
  const page = parseInt(searchParams?.page) || 1
  const limit = 10
  const skip = (page - 1) * limit
  
  const monthParam = searchParams?.month || ''
  
  // Build query where clause based on month filter
  let whereClause = {}
  if (monthParam) {
    const [year, month] = monthParam.split('-')
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 1)
    
    whereClause = {
      date: {
        gte: startDate,
        lt: endDate
      }
    }
  }

  // Execute queries
  const [expenses, totalRows] = await Promise.all([
    db.expense.findMany({
      where: whereClause,
      orderBy: { date: 'desc' },
      skip,
      take: limit,
      include: { category: true }
    }),
    db.expense.count({ where: whereClause })
  ])
  
  const categories = await db.category.findMany({
    orderBy: { name: 'asc' }
  })

  // Prepare pagination data
  const totalPages = Math.ceil(totalRows / limit)

  return (
    <div className="animate-fade-in">
      <ExpenseTableClient 
        expenses={expenses} 
        categories={categories} 
        pagination={{
          currentPage: page,
          totalPages: totalPages === 0 ? 1 : totalPages,
          totalRows
        }}
        currentMonth={monthParam}
      />
    </div>
  )
}
