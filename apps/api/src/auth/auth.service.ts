import { Injectable, UnauthorizedException, Inject } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcryptjs'
import { prisma } from '@sig/database'

@Injectable()
export class AuthService {
  constructor(@Inject(JwtService) private jwt: JwtService) {}

  async login(email: string, password: string, auditCtx?: { ip?: string; userAgent?: string }) {
    const employee = await prisma.employee.findUnique({ where: { email } })
    if (!employee || !employee.active) throw new UnauthorizedException('Invalid credentials')

    const valid = await bcrypt.compare(password, employee.password)
    if (!valid) throw new UnauthorizedException('Invalid credentials')

    const token = this.jwt.sign({ sub: employee.id, role: employee.role })

    await prisma.session.create({
      data: { employeeId: employee.id, token, expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000) },
    })

    try {
      await prisma.audit.create({
        data: {
          employeeId: employee.id,
          employeeName: employee.name,
          employeeEmail: employee.email,
          entityType: 'auth',
          entityId: employee.id,
          operation: 'LOGIN',
          ip: auditCtx?.ip,
          userAgent: auditCtx?.userAgent,
          endpoint: '/auth/login',
          method: 'POST',
        },
      })
    } catch {}

    return { token, employee: { id: employee.id, name: employee.name, email: employee.email, photo: employee.photo, role: employee.role, isAdmin: employee.isAdmin } }
  }

  async me(employeeId: string) {
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      select: { id: true, name: true, email: true, photo: true, role: true, isAdmin: true, active: true },
    })
    if (!employee) throw new UnauthorizedException()
    return employee
  }

  async myPermissions(employeeId: string) {
    const employee = await prisma.employee.findUnique({ where: { id: employeeId } })
    if (!employee || !employee.active) throw new UnauthorizedException()
    if (employee.isAdmin) return { all: true, permissions: [] }

    const groups = await prisma.employeeGroup.findMany({
      where: { employeeId: employee.id },
      include: { group: { include: { permissions: true } } },
    })

    const individuals = await prisma.employeePermission.findMany({ where: { employeeId: employee.id } })

    const merged: Record<string, Record<string, boolean>> = {}

    for (const eg of groups) {
      for (const gp of eg.group.permissions) {
        if (!merged[gp.resource]) merged[gp.resource] = {}
        merged[gp.resource][gp.action] = gp.allowed
      }
    }

    for (const ip of individuals) {
      if (!merged[ip.resource]) merged[ip.resource] = {}
      merged[ip.resource][ip.action] = ip.allowed
    }

    const permissions: { resource: string; action: string }[] = []
    for (const [resource, actions] of Object.entries(merged)) {
      for (const [action, allowed] of Object.entries(actions)) {
        if (allowed) permissions.push({ resource, action })
      }
    }

    return { all: false, permissions }
  }
}
