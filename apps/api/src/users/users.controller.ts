import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Inject } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { UsersService } from './users.service'
import { RequirePermission } from '../common/permission.decorator'
import { PermissionGuard } from '../common/permission.guard'

@UseGuards(AuthGuard('jwt'), PermissionGuard)
@Controller('users')
export class UsersController {
  constructor(@Inject(UsersService) private service: UsersService) {}

  @Get()
  @RequirePermission('USERS', 'VIEW')
  list() {
    return this.service.list()
  }

  @Get(':id')
  @RequirePermission('USERS', 'VIEW')
  getById(@Param('id') id: string) {
    return this.service.getById(id)
  }

  @Post()
  @RequirePermission('USERS', 'CREATE')
  create(@Body() body: { name: string; email?: string; phone?: string; document?: string }) {
    return this.service.create(body)
  }

  @Patch(':id')
  @RequirePermission('USERS', 'EDIT')
  update(@Param('id') id: string, @Body() body: { name?: string; email?: string; phone?: string; document?: string; active?: boolean }) {
    return this.service.update(id, body)
  }

  @Delete(':id')
  @RequirePermission('USERS', 'DELETE')
  remove(@Param('id') id: string) {
    return this.service.remove(id)
  }
}
