import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Inject } from '@nestjs/common'
import { prisma } from '@sig/database'
import * as bcrypt from 'bcryptjs'

const listSelect = { id: true, name: true, email: true, photo: true, isAdmin: true, active: true, createdAt: true, groups: { include: { group: { select: { name: true } } } } }

@Injectable()
export class EmployeesService {
  async list() {
    return prisma.employee.findMany({
      select: listSelect,
      orderBy: { name: 'asc' },
    })
  }

  async getById(id: string) {
    const employee = await prisma.employee.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, cpf: true, phone: true, photo: true, isAdmin: true, active: true, createdAt: true, employeeSystems: { include: { system: true } }, groups: { include: { group: true } }, permissions: true },
    })
    if (!employee) throw new NotFoundException()
    return employee
  }

  async create(data: { name: string; email: string; cpf: string; password: string; isAdmin?: boolean }) {
    const password = await bcrypt.hash(data.password, 10)
    return prisma.employee.create({
      data: { name: data.name, email: data.email, cpf: data.cpf, password, isAdmin: data.isAdmin ?? false },
      select: { id: true, name: true, email: true, photo: true, isAdmin: true },
    })
  }

  async update(id: string, data: { name?: string; email?: string; isAdmin?: boolean; active?: boolean; photo?: string | null }, currentUserId: string) {
    const employee = await prisma.employee.findUnique({ where: { id } })
    if (!employee) throw new NotFoundException()

    await this.validateUpdate(id, data, currentUserId, employee)

    return prisma.employee.update({ where: { id }, data, select: { id: true, name: true, email: true, photo: true, isAdmin: true, active: true } })
  }

  async remove(id: string, currentUserId: string) {
    const employee = await prisma.employee.findUnique({ where: { id } })
    if (!employee) throw new NotFoundException()

    await this.validateDelete(id, currentUserId, employee)

    await prisma.employee.delete({ where: { id } })
  }

  async updatePhoto(id: string, filename: string) {
    const employee = await prisma.employee.findUnique({ where: { id } })
    if (!employee) throw new NotFoundException()
    return prisma.employee.update({
      where: { id },
      data: { photo: `/uploads/avatars/${filename}` },
      select: { id: true, name: true, photo: true },
    })
  }

  async removePhoto(id: string) {
    const employee = await prisma.employee.findUnique({ where: { id } })
    if (!employee) throw new NotFoundException()
    return prisma.employee.update({
      where: { id },
      data: { photo: null },
      select: { id: true, name: true, photo: true },
    })
  }

  private async validateUpdate(id: string, data: { isAdmin?: boolean; active?: boolean }, currentUserId: string, employee: { id: string; isAdmin: boolean; active: boolean }) {
    const currentUser = await prisma.employee.findUnique({ where: { id: currentUserId } })
    if (!currentUser) throw new NotFoundException('Usuário autenticado não encontrado')

    const isSelf = id === currentUserId

    if (isSelf && data.active === false) {
      throw new ForbiddenException('Não é permitido excluir ou desativar a própria conta.')
    }

    if (isSelf && data.isAdmin === false) {
      throw new ForbiddenException('Não é permitido excluir ou desativar a própria conta.')
    }

    if (!currentUser.isAdmin && employee.isAdmin) {
      throw new ForbiddenException('Você não possui permissão para realizar ações em contas administrativas.')
    }

    if (!currentUser.isAdmin && data.isAdmin === true) {
      throw new ForbiddenException('Você não possui permissão para realizar ações em contas administrativas.')
    }

    if ((data.active === false || data.isAdmin === false) && employee.isAdmin) {
      await this.checkLastAdmin(id)
    }
  }

  private async validateDelete(id: string, currentUserId: string, employee: { id: string; isAdmin: boolean; active: boolean }) {
    const currentUser = await prisma.employee.findUnique({ where: { id: currentUserId } })
    if (!currentUser) throw new NotFoundException('Usuário autenticado não encontrado')

    if (id === currentUserId) {
      throw new ForbiddenException('Não é permitido excluir ou desativar a própria conta.')
    }

    if (!currentUser.isAdmin && employee.isAdmin) {
      throw new ForbiddenException('Você não possui permissão para realizar ações em contas administrativas.')
    }

    if (employee.isAdmin) {
      await this.checkLastAdmin(id)
    }

    const hasRecords = await this.checkHasRecords(id)
    if (hasRecords) {
      throw new BadRequestException('Este usuário não pode ser excluído porque possui registros vinculados ao sistema.')
    }
  }

  private async checkLastAdmin(excludingId: string) {
    const count = await prisma.employee.count({
      where: { isAdmin: true, active: true, id: { not: excludingId } },
    })
    if (count === 0) {
      throw new ForbiddenException('Não é permitido excluir, desativar ou remover privilégios do único administrador ativo do sistema.')
    }
  }

  private async checkHasRecords(employeeId: string): Promise<boolean> {
    const [expenseCount, systemCount, sessionCount] = await Promise.all([
      prisma.expense.count({ where: { employeeId } }),
      prisma.employeeSystem.count({ where: { employeeId } }),
      prisma.session.count({ where: { employeeId } }),
    ])
    return expenseCount > 0 || systemCount > 0 || sessionCount > 0
  }
}
