import { PrismaClient, Resource, Action } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const allResources = Object.values(Resource)
const allActions = Object.values(Action)

async function main() {
  const statuses = [
    { name: 'Ativo', slug: 'active', entityType: 'SystemUser', color: '#22c55e', order: 1 },
    { name: 'Inativo', slug: 'inactive', entityType: 'SystemUser', color: '#ef4444', order: 2 },
    { name: 'Pendente', slug: 'pending', entityType: 'SystemUser', color: '#eab308', order: 3 },
    { name: 'Bloqueado', slug: 'blocked', entityType: 'SystemUser', color: '#6b7280', order: 4 },
    { name: 'Pendente', slug: 'pending', entityType: 'Expense', color: '#eab308', order: 1 },
    { name: 'Aprovado', slug: 'approved', entityType: 'Expense', color: '#22c55e', order: 2 },
    { name: 'Rejeitado', slug: 'rejected', entityType: 'Expense', color: '#ef4444', order: 3 },
  ]

  for (const s of statuses) {
    await prisma.status.upsert({
      where: { slug_entityType: { slug: s.slug, entityType: s.entityType } },
      update: {},
      create: s,
    })
  }

  const adminGroup = await prisma.group.upsert({
    where: { name: 'Admin' },
    update: {},
    create: { name: 'Admin', description: 'Acesso total ao sistema' },
  })
  const operatorGroup = await prisma.group.upsert({
    where: { name: 'Operador' },
    update: {},
    create: { name: 'Operador', description: 'Operações do dia a dia' },
  })
  const viewerGroup = await prisma.group.upsert({
    where: { name: 'Visualizador' },
    update: {},
    create: { name: 'Visualizador', description: 'Acesso somente leitura' },
  })

  for (const resource of allResources) {
    for (const action of allActions) {
      await prisma.groupPermission.upsert({
        where: { groupId_resource_action: { groupId: adminGroup.id, resource, action } },
        update: {},
        create: { groupId: adminGroup.id, resource, action, allowed: true },
      })
    }
  }

  const operResources = [Resource.EMPLOYEES, Resource.SYSTEMS, Resource.USERS, Resource.EXPENSES]
  for (const resource of operResources) {
    for (const action of [Action.VIEW, Action.CREATE, Action.EDIT, Action.MENU]) {
      await prisma.groupPermission.upsert({
        where: { groupId_resource_action: { groupId: operatorGroup.id, resource, action } },
        update: {},
        create: { groupId: operatorGroup.id, resource, action, allowed: true },
      })
    }
  }
  for (const action of [Action.VIEW, Action.MENU]) {
    await prisma.groupPermission.upsert({
      where: { groupId_resource_action: { groupId: operatorGroup.id, resource: Resource.STATUSES, action } },
      update: {},
      create: { groupId: operatorGroup.id, resource: Resource.STATUSES, action, allowed: true },
    })
  }
  await prisma.groupPermission.upsert({
    where: { groupId_resource_action: { groupId: operatorGroup.id, resource: Resource.DASHBOARD, action: Action.VIEW } },
    update: {},
    create: { groupId: operatorGroup.id, resource: Resource.DASHBOARD, action: Action.VIEW, allowed: true },
  })

  for (const resource of allResources) {
    for (const action of [Action.VIEW, Action.MENU]) {
      await prisma.groupPermission.upsert({
        where: { groupId_resource_action: { groupId: viewerGroup.id, resource, action } },
        update: {},
        create: { groupId: viewerGroup.id, resource, action, allowed: true },
      })
    }
  }

  const adminEmp = await prisma.employee.findUnique({ where: { email: 'admin@sig.com' } })
  if (!adminEmp) {
    const password = await bcrypt.hash('admin123', 10)
    const emp = await prisma.employee.create({
      data: { name: 'Admin', email: 'admin@sig.com', cpf: '00000000000', password, isAdmin: true },
    })
    await prisma.employeeGroup.create({ data: { employeeId: emp.id, groupId: adminGroup.id } })
  } else {
    await prisma.employee.update({ where: { id: adminEmp.id }, data: { isAdmin: true } })
    const hasGroup = await prisma.employeeGroup.findUnique({
      where: { employeeId_groupId: { employeeId: adminEmp.id, groupId: adminGroup.id } },
    })
    if (!hasGroup) {
      await prisma.employeeGroup.create({ data: { employeeId: adminEmp.id, groupId: adminGroup.id } })
    }
  }

  const marina = await prisma.employee.findUnique({ where: { email: 'marina@sig.com' } })
  if (!marina) {
    const password = await bcrypt.hash('marina123', 10)
    const emp = await prisma.employee.create({
      data: { name: 'Marina Santos', email: 'marina@sig.com', cpf: '11111111111', password },
    })
    await prisma.employeeGroup.create({ data: { employeeId: emp.id, groupId: operatorGroup.id } })
  } else {
    const hasGroup = await prisma.employeeGroup.findUnique({
      where: { employeeId_groupId: { employeeId: marina.id, groupId: operatorGroup.id } },
    })
    if (!hasGroup) {
      await prisma.employeeGroup.create({ data: { employeeId: marina.id, groupId: operatorGroup.id } })
    }
  }

  console.log('Seed completed')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
