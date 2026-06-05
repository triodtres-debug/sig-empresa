import { Injectable, CanActivate, ExecutionContext, Inject } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Role } from '@sig/database'
import { ROLES_KEY } from './roles.decorator'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(@Inject(Reflector) private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (!required) return true
    const { user } = context.switchToHttp().getRequest()
    return required.includes(user.role)
  }
}
