import { Injectable, NotFoundException } from '@nestjs/common'
import { prisma } from '@sig/database'

@Injectable()
export class ExpensesService {
  async list() {
    return prisma.expense.findMany({
      orderBy: { date: 'desc' },
      include: { employee: { select: { id: true, name: true } }, system: { select: { id: true, name: true } }, status: true },
    })
  }

  async getById(id: string) {
    const expense = await prisma.expense.findUnique({
      where: { id },
      include: { employee: { select: { id: true, name: true } }, system: { select: { id: true, name: true } }, status: true },
    })
    if (!expense) throw new NotFoundException()
    return expense
  }

  async create(data: { description: string; amount: number; date: string; category?: string; employeeId: string; systemId?: string; statusId?: string }) {
    return prisma.expense.create({
      data: { ...data, date: new Date(data.date) },
      include: { status: true },
    })
  }

  async update(id: string, data: { description?: string; amount?: number; date?: string; category?: string; statusId?: string }) {
    const expense = await prisma.expense.findUnique({ where: { id } })
    if (!expense) throw new NotFoundException()
    return prisma.expense.update({
      where: { id },
      data: data.date ? { ...data, date: new Date(data.date) } : data,
      include: { status: true },
    })
  }
}
