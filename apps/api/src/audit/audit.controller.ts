import { Controller, Get, Query, UseGuards, Inject } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { prisma } from '@sig/database'
import { RequirePermission } from '../common/permission.decorator'
import { PermissionGuard } from '../common/permission.guard'

@UseGuards(AuthGuard('jwt'), PermissionGuard)
@Controller('audit')
export class AuditController {
  @Get()
  @RequirePermission('AUTHORIZATIONS', 'VIEW')
  async list(
    @Query('page') page = '1',
    @Query('limit') limit = '50',
    @Query('employeeId') employeeId?: string,
    @Query('entityType') entityType?: string,
    @Query('operation') operation?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ): Promise<{ items: unknown[]; total: number; page: number; limit: number }> {
    const skip = (parseInt(page) - 1) * parseInt(limit)
    const take = Math.min(parseInt(limit), 200)

    const where: any = {}
    if (employeeId) where.employeeId = employeeId
    if (entityType) where.entityType = entityType
    if (operation) where.operation = operation
    if (dateFrom || dateTo) {
      where.createdAt = {}
      if (dateFrom) where.createdAt.gte = new Date(dateFrom)
      if (dateTo) where.createdAt.lte = new Date(dateTo)
    }

    const [items, total] = await Promise.all([
      prisma.audit.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.audit.count({ where }),
    ])

    return { items, total, page: parseInt(page), limit: take }
  }
}
