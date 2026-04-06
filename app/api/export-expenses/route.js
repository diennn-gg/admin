import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import * as xlsx from 'xlsx'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') // 'month' or 'year'
  const value = searchParams.get('value')

  if (!type || !value) {
    return NextResponse.json({ error: 'Missing type or value' }, { status: 400 })
  }

  let whereClause = {}
  
  if (type === 'month') {
    const [year, month] = value.split('-')
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 1)
    
    whereClause = {
      date: {
        gte: startDate,
        lt: endDate
      }
    }
  } else if (type === 'year') {
    const year = parseInt(value, 10)
    const startDate = new Date(year, 0, 1)
    const endDate = new Date(year + 1, 0, 1)
    
    whereClause = {
      date: {
        gte: startDate,
        lt: endDate
      }
    }
  }

  try {
    const expenses = await db.expense.findMany({
      where: whereClause,
      orderBy: { date: 'asc' },
      include: { category: true }
    })

    const data = expenses.map(exp => ({
      'Ngày': new Date(exp.date).toLocaleDateString('vi-VN'),
      'Mục chi': exp.title,
      'Danh mục': exp.category?.name || 'Không có',
      'Số tiền': exp.amount
    }))

    // Add total row
    const totalAmount = expenses.reduce((acc, curr) => acc + curr.amount, 0)
    data.push({
      'Ngày': 'Tổng cộng',
      'Mục chi': '',
      'Danh mục': '',
      'Số tiền': totalAmount
    })

    const worksheet = xlsx.utils.json_to_sheet(data)

    // Optional: Auto-fit column widths
    const colWidths = [
      { wch: 15 }, // Ngày
      { wch: 30 }, // Mục chi
      { wch: 20 }, // Danh mục
      { wch: 15 }  // Số tiền
    ];
    worksheet['!cols'] = colWidths;

    const workbook = xlsx.utils.book_new()
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Chi Tiêu')

    // Generate buffer
    const buf = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' })

    const fileName = `ChiTieu_${type === 'month' ? 'Thang' : 'Nam'}_${value}.xlsx`

    return new Response(buf, {
      status: 200,
      headers: {
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json({ error: 'Failed to export Excel' }, { status: 500 })
  }
}
