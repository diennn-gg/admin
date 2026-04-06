import { db } from '@/lib/db'
import { ArrowDownRight, TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react'
import Link from 'next/link'
import styles from './dashboard.module.css'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const currentDate = new Date()
  const startOfCurrentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  const startOfNextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)

  const startOfPrevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)

  const [currentMonthExpenses, prevMonthExpenses, recentExpenses, totalIncomeAgg, totalExpenseAgg, allExpensesByDate] = await Promise.all([
    db.expense.findMany({
      where: { date: { gte: startOfCurrentMonth, lt: startOfNextMonth } }
    }),
    db.expense.findMany({
      where: { date: { gte: startOfPrevMonth, lt: startOfCurrentMonth } }
    }),
    db.expense.findMany({
      orderBy: { date: 'desc' },
      take: 5,
      include: { category: true }
    }),
    db.income.aggregate({
      _sum: { amount: true }
    }),
    db.expense.aggregate({
      _sum: { amount: true }
    }),
    db.expense.findMany({
      select: { date: true, amount: true },
      orderBy: { date: 'desc' }
    })
  ])
  
  const currentTotal = currentMonthExpenses.reduce((acc, curr) => acc + curr.amount, 0)
  const prevTotal = prevMonthExpenses.reduce((acc, curr) => acc + curr.amount, 0)
  const totalIncome = totalIncomeAgg._sum.amount || 0
  const totalAllExpense = totalExpenseAgg._sum.amount || 0
  
  // Group expenses by month in JS memory
  const monthlyData = {}
  allExpensesByDate.forEach(exp => {
    // exp.date is a Date object. get YYYY-MM
    const key = `${exp.date.getFullYear()}-${String(exp.date.getMonth() + 1).padStart(2, '0')}`
    if (!monthlyData[key]) monthlyData[key] = { label: `Tháng ${exp.date.getMonth() + 1}/${exp.date.getFullYear()}`, amount: 0 }
    monthlyData[key].amount += exp.amount
  })
  
  const monthlySummaryList = Object.values(monthlyData)
  

  
  // Calculate difference
  let percentChange = 0
  if (prevTotal > 0) {
    percentChange = ((currentTotal - prevTotal) / prevTotal) * 100
  }

  // Format currency
  const formatter = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  })

  return (
    <div className="animate-fade-in">
      <div className={styles.grid}>
        <div className={`glass-panel ${styles.statCard} ${styles.danger}`}>
          <div className={styles.statTitle}>
            <ArrowDownRight size={18} />
            Tổng tất cả chi tiêu
          </div>
          <div className={styles.statValue}>
            {formatter.format(totalAllExpense)}
          </div>
          <div className={styles.statDesc}>
            Tổng chi tiêu ghi nhận từ trước đến nay
          </div>
        </div>

        <div className={`glass-panel ${styles.statCard} ${styles.success}`}>
          <div className={styles.statTitle}>
            <TrendingUp size={18} />
            Tổng thu tất cả
          </div>
          <div className={styles.statValue}>
            {formatter.format(totalIncome)}
          </div>
          <div className={styles.statDesc}>
            Tổng thu nhập ghi nhận từ trước đến nay
          </div>
        </div>

        <div className={`glass-panel ${styles.statCard}`}>
          <div className={styles.statTitle}>
            <Activity size={18} />
            Lần cập nhật cuối
          </div>
          <div className={styles.statValue}>
            {recentExpenses.length > 0 
              ? new Date(recentExpenses[0].createdAt).toLocaleDateString('vi-VN') 
              : 'Chưa có'}
          </div>
          <div className={styles.statDesc}>
            Dữ liệu gần nhất trong hệ thống
          </div>
        </div>
      </div>

      <div className={styles.twoColumns}>
        <div className={styles.recentSection}>
          <div className={styles.recentHeader}>
            <h2>Chi tiêu gần đây</h2>
            <Link href="/dashboard/expenses" className={styles.viewAllBtn}>
              Xem tất cả
            </Link>
          </div>

          <div className="glass-panel" style={{ overflowX: 'auto' }}>
            {recentExpenses.length === 0 ? (
              <div className={styles.emptyState}>
                Chưa có khoản chi tiêu nào.
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--panel-border)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '1rem', minWidth: '180px' }}>Mục chi</th >
                    <th style={{ padding: '1rem', minWidth: '100px' }}>Ngày</th>
                    <th style={{ padding: '1rem', textAlign: 'right', minWidth: '120px' }}>Số tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {recentExpenses.map(expense => (
                    <tr key={expense.id} style={{ borderBottom: '1px solid var(--panel-border)' }}>
                      <td style={{ padding: '1rem', fontWeight: 500 }}>
                        {expense.title}
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                          {expense.category?.name || 'Không có'}
                        </div>
                      </td>
                      <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                        {new Date(expense.date).toLocaleDateString('vi-VN')}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: 'var(--danger-color)' }}>
                        -{formatter.format(expense.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className={styles.recentSection}>
          <div className={styles.recentHeader}>
            <h2>Tổng hợp từng tháng</h2>
          </div>

          <div className="glass-panel" style={{ overflowX: 'auto' }}>
            {monthlySummaryList.length === 0 ? (
              <div className={styles.emptyState}>
                Chưa có dữ liệu thống kê.
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--panel-border)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '1rem' }}>Thời gian</th >
                    <th style={{ padding: '1rem', textAlign: 'right' }}>Tổng đã chi</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlySummaryList.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--panel-border)' }}>
                      <td style={{ padding: '1rem', fontWeight: 500 }}>{item.label}</td>
                      <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: 'var(--danger-color)' }}>
                        -{formatter.format(item.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
