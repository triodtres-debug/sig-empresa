import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Inject } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { SystemsService } from './systems.service'
import { RequirePermission } from '../common/permission.decorator'
import { PermissionGuard } from '../common/permission.guard'

@UseGuards(AuthGuard('jwt'), PermissionGuard)
@Controller('systems')
export class SystemsController {
  constructor(@Inject(SystemsService) private service: SystemsService) {}

  @Get()
  @RequirePermission('SYSTEMS', 'VIEW')
  list() {
    return this.service.list()
  }

  @Get(':id')
  @RequirePermission('SYSTEMS', 'VIEW')
  getById(@Param('id') id: string) {
    return this.service.getById(id)
  }

  @Post()
  @RequirePermission('SYSTEMS', 'CREATE')
  create(@Body() body: { name: string; slug: string; description?: string; baseUrl?: string }) {
    return this.service.create(body)
  }

  @Patch(':id')
  @RequirePermission('SYSTEMS', 'EDIT')
  update(@Param('id') id: string, @Body() body: { name?: string; slug?: string; description?: string; baseUrl?: string; active?: boolean }) {
    return this.service.update(id, body)
  }

  @Delete(':id')
  @RequirePermission('SYSTEMS', 'DELETE')
  remove(@Param('id') id: string) {
    return this.service.remove(id)
  }

  @Post(':id/employees/:employeeId')
  @RequirePermission('SYSTEMS', 'EDIT')
  assignEmployee(@Param('id') id: string, @Param('employeeId') employeeId: string) {
    return this.service.assignEmployee(id, employeeId)
  }

  @Delete(':id/employees/:employeeId')
  @RequirePermission('SYSTEMS', 'EDIT')
  removeEmployee(@Param('id') id: string, @Param('employeeId') employeeId: string) {
    return this.service.removeEmployee(id, employeeId)
  }
}
