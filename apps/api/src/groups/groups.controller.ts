import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Inject } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { GroupsService } from './groups.service'
import { RequirePermission } from '../common/permission.decorator'
import { PermissionGuard } from '../common/permission.guard'

@UseGuards(AuthGuard('jwt'), PermissionGuard)
@Controller('groups')
export class GroupsController {
  constructor(@Inject(GroupsService) private service: GroupsService) {}

  @Get()
  @RequirePermission('GROUPS', 'VIEW')
  list() {
    return this.service.list()
  }

  @Get(':id')
  @RequirePermission('GROUPS', 'VIEW')
  getById(@Param('id') id: string) {
    return this.service.getById(id)
  }

  @Post()
  @RequirePermission('GROUPS', 'CREATE')
  create(@Body() body: { name: string; description?: string }) {
    return this.service.create(body)
  }

  @Patch(':id')
  @RequirePermission('GROUPS', 'EDIT')
  update(@Param('id') id: string, @Body() body: { name?: string; description?: string }) {
    return this.service.update(id, body)
  }

  @Delete(':id')
  @RequirePermission('GROUPS', 'DELETE')
  remove(@Param('id') id: string) {
    return this.service.remove(id)
  }

  @Post(':id/permissions')
  @RequirePermission('GROUPS', 'EDIT')
  setPermission(@Param('id') id: string, @Body() body: { resource: string; action: string; allowed: boolean }) {
    return this.service.setPermission(id, body.resource, body.action, body.allowed)
  }

  @Delete(':id/permissions/:resource/:action')
  @RequirePermission('GROUPS', 'EDIT')
  removePermission(@Param('id') id: string, @Param('resource') resource: string, @Param('action') action: string) {
    return this.service.removePermission(id, resource, action)
  }

  @Post(':id/employees/:employeeId')
  @RequirePermission('GROUPS', 'EDIT')
  addEmployee(@Param('id') id: string, @Param('employeeId') employeeId: string) {
    return this.service.addEmployee(id, employeeId)
  }

  @Delete(':id/employees/:employeeId')
  @RequirePermission('GROUPS', 'EDIT')
  removeEmployee(@Param('id') id: string, @Param('employeeId') employeeId: string) {
    return this.service.removeEmployee(id, employeeId)
  }
}
