import { Injectable, CanActivate, ExecutionContext, Inject } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { prisma } from '@sig/database'
import { PERMISSION_KEY } from './permission.decorator'

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(@Inject(Reflector) private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<{ resource: string; action: string }>(PERMISSION_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (!required) return true

    const { user } = context.switchToHttp().getRequest()
    if (!user) return false

    const employee = await prisma.employee.findUnique({ where: { id: user.sub } })
    if (!employee || !employee.active) return false
    if (employee.isAdmin) return true

    const groups = await prisma.employeeGroup.findMany({
      where: { employeeId: employee.id },
      include: { group: { include: { permissions: true } } },
    })

    for (const eg of groups) {
      const gp = eg.group.permissions.find(p => p.resource === required.resource && p.action === required.action)
      if (gp) {
        const individual = await prisma.employeePermission.findUnique({
          where: { employeeId_resource_action: { employeeId: employee.id, resource: required.resource as any, action: required.action as any } },
        })
        if (individual) return individual.allowed
        return gp.allowed
      }
    }

    return false
  }
}
