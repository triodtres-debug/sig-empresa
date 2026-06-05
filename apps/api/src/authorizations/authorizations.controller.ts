import { Controller, Get, Post, Delete, Param, Body, UseGuards, Inject } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { AuthorizationsService } from './authorizations.service'
import { RequirePermission } from '../common/permission.decorator'
import { PermissionGuard } from '../common/permission.guard'

@UseGuards(AuthGuard('jwt'), PermissionGuard)
@Controller('authorizations')
export class AuthorizationsController {
  constructor(@Inject(AuthorizationsService) private service: AuthorizationsService) {}

  @Get('employees')
  @RequirePermission('AUTHORIZATIONS', 'VIEW')
  listEmployees() {
    return this.service.listEmployees()
  }

  @Get('employees/:id')
  @RequirePermission('AUTHORIZATIONS', 'VIEW')
  getEmployee(@Param('id') id: string) {
    return this.service.getEmployee(id)
  }

  @Get('resources')
  @RequirePermission('AUTHORIZATIONS', 'VIEW')
  listResources() {
    return this.service.listResources()
  }

  @Post('employees/:id/permissions')
  @RequirePermission('AUTHORIZATIONS', 'EDIT')
  setPermission(@Param('id') id: string, @Body() body: { resource: string; action: string; allowed: boolean }) {
    return this.service.setIndividualPermission(id, body.resource, body.action, body.allowed)
  }

  @Delete('employees/:id/permissions/:resource/:action')
  @RequirePermission('AUTHORIZATIONS', 'EDIT')
  removePermission(@Param('id') id: string, @Param('resource') resource: string, @Param('action') action: string) {
    return this.service.removeIndividualPermission(id, resource, action)
  }
}
