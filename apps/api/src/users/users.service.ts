import { Injectable, NotFoundException } from '@nestjs/common'
import { prisma } from '@sig/database'

@Injectable()
export class UsersService {
  async list() {
    return prisma.user.findMany({ orderBy: { name: 'asc' }, include: { _count: { select: { systemUsers: true } } } })
  }

  async getById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { systemUsers: { include: { system: true, status: true } } },
    })
    if (!user) throw new NotFoundException()
    return user
  }

  async create(data: { name: string; email?: string; phone?: string; document?: string; externalId?: string }) {
    return prisma.user.create({ data })
  }

  async update(id: string, data: { name?: string; email?: string; phone?: string; document?: string; externalId?: string; active?: boolean }) {
    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) throw new NotFoundException()
    return prisma.user.update({ where: { id }, data })
  }

  async remove(id: string) {
    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) throw new NotFoundException()
    await prisma.user.delete({ where: { id } })
  }
}
