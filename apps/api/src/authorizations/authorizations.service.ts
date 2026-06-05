import { Injectable, NotFoundException } from '@nestjs/common'
import { prisma } from '@sig/database'

@Injectable()
export class AuthorizationsService {
  async listEmployees() {
    return prisma.employee.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        photo: true,
        isAdmin: true,
        active: true,
        groups: { include: { group: { select: { id: true, name: true } } } },
      },
      orderBy: { name: 'asc' },
    })
  }

  async getEmployee(employeeId: string) {
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      select: {
        id: true,
        name: true,
        email: true,
        photo: true,
        isAdmin: true,
        active: true,
        groups: { include: { group: { include: { permissions: true } } } },
        permissions: true,
      },
    })
    if (!employee) throw new NotFoundException()
    return employee
  }

  async setIndividualPermission(employeeId: string, resource: string, action: string, allowed: boolean) {
    const employee = await prisma.employee.findUnique({ where: { id: employeeId } })
    if (!employee) throw new NotFoundException()
    return prisma.employeePermission.upsert({
      where: { employeeId_resource_action: { employeeId, resource: resource as any, action: action as any } },
      update: { allowed },
      create: { employeeId, resource: resource as any, action: action as any, allowed },
    })
  }

  async removeIndividualPermission(employeeId: string, resource: string, action: string) {
    await prisma.employeePermission.deleteMany({
      where: { employeeId, resource: resource as any, action: action as any },
    })
  }

  async addGroup(employeeId: string, groupId: string) {
    return prisma.employeeGroup.create({ data: { employeeId, groupId } })
  }

  async removeGroup(employeeId: string, groupId: string) {
    await prisma.employeeGroup.deleteMany({ where: { employeeId, groupId } })
  }

  async listResources() {
    const resources: { name: string; actions: string[] }[] = [
      { name: 'DASHBOARD', actions: ['VIEW', 'MENU'] },
      { name: 'EMPLOYEES', actions: ['VIEW', 'CREATE', 'EDIT', 'DELETE', 'MENU'] },
      { name: 'SYSTEMS', actions: ['VIEW', 'CREATE', 'EDIT', 'DELETE', 'MENU'] },
      { name: 'USERS', actions: ['VIEW', 'CREATE', 'EDIT', 'DELETE', 'MENU'] },
      { name: 'EXPENSES', actions: ['VIEW', 'CREATE', 'EDIT', 'DELETE', 'MENU'] },
      { name: 'STATUSES', actions: ['VIEW', 'CREATE', 'EDIT', 'DELETE', 'MENU'] },
      { name: 'GROUPS', actions: ['VIEW', 'CREATE', 'EDIT', 'DELETE', 'MENU'] },
      { name: 'AUTHORIZATIONS', actions: ['VIEW', 'CREATE', 'EDIT', 'DELETE', 'MENU'] },
    ]
    return resources
  }
}
