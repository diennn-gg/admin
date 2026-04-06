const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  const user = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
    },
  })

  const catFood = await prisma.category.create({ data: { name: 'Ăn uống', color: '#ff7675' }})
  const catTransport = await prisma.category.create({ data: { name: 'Di chuyển', color: '#74b9ff' }})
  const catBill = await prisma.category.create({ data: { name: 'Hóa đơn', color: '#55efc4' }})
  const catShopping = await prisma.category.create({ data: { name: 'Mua sắm', color: '#fdcb6e' }})
  const catOther = await prisma.category.create({ data: { name: 'Khác', color: '#b2bec3' }})

  // Seed sample expenses
  await prisma.expense.createMany({
    data: [
      {
        title: 'Mua thực phẩm tuần',
        amount: 850000,
        categoryId: catFood.id,
        date: new Date('2023-11-01T10:00:00Z'),
      },
      {
        title: 'Tiền điện tháng 10',
        amount: 1200000,
        categoryId: catBill.id,
        date: new Date('2023-11-05T14:30:00Z'),
      },
      {
        title: 'Ăn tối ngoài',
        amount: 450000,
        categoryId: catFood.id,
        date: new Date('2023-11-10T19:00:00Z'),
      }
    ]
  })

  // Seed sample incomes
  await prisma.income.createMany({
    data: [
      {
        title: 'Lương tháng 10',
        amount: 25000000,
        source: 'Công ty ABC',
        date: new Date('2023-11-02T08:00:00Z'),
      },
      {
        title: 'Bán đồ cũ',
        amount: 1500000,
        source: 'Cá nhân',
        date: new Date('2023-11-08T15:00:00Z'),
      }
    ]
  })

  console.log('Seeded database successfully!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
