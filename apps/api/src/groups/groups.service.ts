import { Injectable, NotFoundException } from '@nestjs/common'
import { prisma } from '@sig/database'

@Injectable()
export class GroupsService {
  async list() {
    return prisma.group.findMany({
      include: { _count: { select: { employees: true } }, permissions: true },
      orderBy: { name: 'asc' },
    })
  }

  async getById(id: string) {
    const group = await prisma.group.findUnique({
      where: { id },
      include: { permissions: true, employees: { include: { employee: { select: { id: true, name: true, email: true } } } } },
    })
    if (!group) throw new NotFoundException()
    return group
  }

  async create(data: { name: string; description?: string }) {
    return prisma.group.create({ data })
  }

  async update(id: string, data: { name?: string; description?: string }) {
    const group = await prisma.group.findUnique({ where: { id } })
    if (!group) throw new NotFoundException()
    return prisma.group.update({ where: { id }, data })
  }

  async remove(id: string) {
    const group = await prisma.group.findUnique({ where: { id } })
    if (!group) throw new NotFoundException()
    await prisma.employeeGroup.deleteMany({ where: { groupId: id } })
    await prisma.groupPermission.deleteMany({ where: { groupId: id } })
    return prisma.group.delete({ where: { id } })
  }

  async setPermission(groupId: string, resource: string, action: string, allowed: boolean) {
    const group = await prisma.group.findUnique({ where: { id: groupId } })
    if (!group) throw new NotFoundException()
    return prisma.groupPermission.upsert({
      where: { groupId_resource_action: { groupId, resource: resource as any, action: action as any } },
      update: { allowed },
      create: { groupId, resource: resource as any, action: action as any, allowed },
    })
  }

  async removePermission(groupId: string, resource: string, action: string) {
    return prisma.groupPermission.deleteMany({
      where: { groupId, resource: resource as any, action: action as any },
    })
  }

  async addEmployee(groupId: string, employeeId: string) {
    return prisma.employeeGroup.upsert({
      where: { employeeId_groupId: { employeeId, groupId } },
      update: {},
      create: { groupId, employeeId },
    })
  }

  async removeEmployee(groupId: string, employeeId: string) {
    return prisma.employeeGroup.deleteMany({ where: { groupId, employeeId } })
  }
}
