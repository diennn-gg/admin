import { db } from '@/lib/db'
import IncomeTableClient from './IncomeTableClient'

export const dynamic = 'force-dynamic'

export default async function IncomesPage(props) {
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
      date: { gte: startDate, lt: endDate }
    }
  }

  // Execute queries
  const [incomes, totalRows] = await Promise.all([
    db.income.findMany({
      where: whereClause,
      orderBy: { date: 'desc' },
      skip,
      take: limit
    }),
    db.income.count({ where: whereClause })
  ])
  
  // Prepare pagination data
  const totalPages = Math.ceil(totalRows / limit)

  return (
    <div className="animate-fade-in">
      <IncomeTableClient 
        incomes={incomes} 
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
