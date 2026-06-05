import { Injectable, NotFoundException } from '@nestjs/common'
import { prisma } from '@sig/database'

@Injectable()
export class SystemsService {
  async list() {
    return prisma.system.findMany({ orderBy: { name: 'asc' } })
  }

  async getById(id: string) {
    const system = await prisma.system.findUnique({
      where: { id },
      include: { employeeSystems: { include: { employee: { select: { id: true, name: true, email: true } } } }, _count: { select: { systemUsers: true } } },
    })
    if (!system) throw new NotFoundException()
    return system
  }

  async create(data: { name: string; slug: string; description?: string; baseUrl?: string }) {
    return prisma.system.create({ data })
  }

  async update(id: string, data: { name?: string; slug?: string; description?: string; baseUrl?: string; active?: boolean }) {
    const system = await prisma.system.findUnique({ where: { id } })
    if (!system) throw new NotFoundException()
    return prisma.system.update({ where: { id }, data })
  }

  async remove(id: string) {
    const system = await prisma.system.findUnique({ where: { id } })
    if (!system) throw new NotFoundException()
    await prisma.employeeSystem.deleteMany({ where: { systemId: id } })
    await prisma.expense.updateMany({ where: { systemId: id }, data: { systemId: null } })
    await prisma.system.delete({ where: { id } })
  }

  async assignEmployee(systemId: string, employeeId: string) {
    return prisma.employeeSystem.create({ data: { systemId, employeeId } })
  }

  async removeEmployee(systemId: string, employeeId: string) {
    await prisma.employeeSystem.delete({ where: { employeeId_systemId: { employeeId, systemId } } })
  }
}
