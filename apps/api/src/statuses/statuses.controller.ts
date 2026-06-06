import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards, Inject } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { StatusesService } from './statuses.service'
import { RequirePermission } from '../common/permission.decorator'
import { PermissionGuard } from '../common/permission.guard'

@UseGuards(AuthGuard('jwt'), PermissionGuard)
@Controller('statuses')
export class StatusesController {
  constructor(@Inject(StatusesService) private service: StatusesService) {}

  @Get()
  @RequirePermission('STATUSES', 'VIEW')
  list(@Query('entityType') entityType?: string) {
    return this.service.list(entityType)
  }

  @Post()
  @RequirePermission('STATUSES', 'CREATE')
  create(@Body() body: { name: string; slug: string; entityType: string; color?: string; order?: number }) {
    return this.service.create(body)
  }

  @Patch(':id')
  @RequirePermission('STATUSES', 'EDIT')
  update(@Param('id') id: string, @Body() body: { name?: string; color?: string; order?: number }) {
    return this.service.update(id, body)
  }
}
