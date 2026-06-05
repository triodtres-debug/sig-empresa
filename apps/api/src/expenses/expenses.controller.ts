import { Controller, Get, Post, Patch, Param, Body, UseGuards, Req, Inject } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ExpensesService } from './expenses.service'
import { RequirePermission } from '../common/permission.decorator'
import { PermissionGuard } from '../common/permission.guard'

@UseGuards(AuthGuard('jwt'), PermissionGuard)
@Controller('expenses')
export class ExpensesController {
  constructor(@Inject(ExpensesService) private service: ExpensesService) {}

  @Get()
  @RequirePermission('EXPENSES', 'VIEW')
  list() {
    return this.service.list()
  }

  @Get(':id')
  @RequirePermission('EXPENSES', 'VIEW')
  getById(@Param('id') id: string) {
    return this.service.getById(id)
  }

  @Post()
  @RequirePermission('EXPENSES', 'CREATE')
  create(@Body() body: { description: string; amount: number; date: string; category?: string; systemId?: string; statusId?: string }, @Req() req: any) {
    return this.service.create({ ...body, employeeId: req.user.sub })
  }

  @Patch(':id')
  @RequirePermission('EXPENSES', 'EDIT')
  update(@Param('id') id: string, @Body() body: { description?: string; amount?: number; date?: string; category?: string; statusId?: string }) {
    return this.service.update(id, body)
  }
}
