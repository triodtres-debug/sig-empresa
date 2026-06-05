import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'
import { prisma } from '@sig/database'

const entityMap: Record<string, string> = {
  statuses: 'status',
}

function extractEntityType(routePath: string): string | null {
  if (!routePath) return null
  const segments = routePath.split('/').filter(Boolean)
  if (segments.length === 0) return null
  const first = segments[0]
  if (first === 'auth') return null
  return entityMap[first] || (first.endsWith('s') ? first.slice(0, -1) : first)
}

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest()
    const method = req.method

    if (!['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) return next.handle()

    const routePath: string = req.route?.path
    const entityType = extractEntityType(routePath)
    if (!entityType) return next.handle()

    const entityId: string | undefined = req.params?.id

    let before: any = null
    if (entityId && ['PATCH', 'PUT', 'DELETE'].includes(method)) {
      before = await this.readEntity(entityType, entityId)
    }

    return next.handle().pipe(
      tap(async (responseBody: any) => {
        if (!req.user?.sub) return
        const after = method === 'DELETE' ? null : responseBody
        const employee = await prisma.employee.findUnique({
          where: { id: req.user.sub },
          select: { id: true, name: true, email: true },
        })

        try {
          await prisma.audit.create({
            data: {
              employeeId: employee?.id || req.user.sub,
              employeeName: employee?.name || 'Desconhecido',
              employeeEmail: employee?.email || '',
              entityType,
              entityId: entityId || responseBody?.id || null,
              operation: method === 'POST' ? 'CREATE' : method === 'DELETE' ? 'DELETE' : 'UPDATE',
              before: before ?? undefined,
              after: after ?? undefined,
              ip: req.ip,
              userAgent: req.headers?.['user-agent'],
              endpoint: routePath,
              method,
            },
          })
        } catch {}
      }),
    )
  }

  private async readEntity(entityType: string, id: string): Promise<any> {
    try {
      return await (prisma as any)[entityType].findUnique({ where: { id } })
    } catch {
      return null
    }
  }
}
