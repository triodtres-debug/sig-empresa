import { Module } from '@nestjs/common'
import { AuthModule } from './auth/auth.module'
import { EmployeesModule } from './employees/employees.module'
import { UsersModule } from './users/users.module'
import { SystemsModule } from './systems/systems.module'
import { ExpensesModule } from './expenses/expenses.module'
import { StatusesModule } from './statuses/statuses.module'
import { GroupsModule } from './groups/groups.module'
import { AuthorizationsModule } from './authorizations/authorizations.module'
import { AuditModule } from './audit/audit.module'

@Module({
  imports: [AuthModule, EmployeesModule, UsersModule, SystemsModule, ExpensesModule, StatusesModule, GroupsModule, AuthorizationsModule, AuditModule],
})
export class AppModule {}
