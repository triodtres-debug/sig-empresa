import { Injectable, NotFoundException } from '@nestjs/common'
import { prisma } from '@sig/database'

@Injectable()
export class StatusesService {
  async list(entityType?: string) {
    const where = entityType ? { entityType } : {}
    return prisma.status.findMany({ where, orderBy: [{ entityType: 'asc' }, { order: 'asc' }] })
  }

  async create(data: { name: string; slug: string; entityType: string; color?: string; order?: number }) {
    return prisma.status.create({ data })
  }

  async update(id: string, data: { name?: string; color?: string; order?: number }) {
    const status = await prisma.status.findUnique({ where: { id } })
    if (!status) throw new NotFoundException()
    return prisma.status.update({ where: { id }, data })
  }
}
