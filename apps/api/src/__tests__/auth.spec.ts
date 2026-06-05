const mockFindUnique = jest.fn()
const mockSessionCreate = jest.fn()

jest.mock('@sig/database', () => ({
  prisma: {
    employee: { findUnique: mockFindUnique, create: jest.fn(), update: jest.fn() },
    session: { create: mockSessionCreate },
  },
  Role: { ADMIN: 'ADMIN', MANAGER: 'MANAGER', OPERATOR: 'OPERATOR', VIEWER: 'VIEWER' },
}))

import * as bcrypt from 'bcryptjs'
import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { PassportModule } from '@nestjs/passport'
import { JwtService } from '@nestjs/jwt'
import { AuthController } from '../auth/auth.controller'
import { AuthService } from '../auth/auth.service'

const adminUser = {
  id: 'emp-1', name: 'Admin', email: 'admin@sig.com',
  cpf: '00000000000', password: '', role: 'ADMIN' as const, active: true,
  createdAt: new Date(), updatedAt: new Date(),
}

describe('POST /api/auth/login', () => {
  let app: INestApplication

  beforeAll(async () => {
    adminUser.password = bcrypt.hashSync('admin123', 10)

    mockFindUnique.mockImplementation(
      ({ where }: { where: { id?: string; email?: string } }) => {
        if (where.email === adminUser.email || where.id === adminUser.id) return adminUser
        return null
      },
    )
    mockSessionCreate.mockResolvedValue({
      id: 'sess-1', token: 'test', employeeId: 'emp-1',
      expiresAt: new Date(), createdAt: new Date(),
    })

    const module: TestingModule = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
      controllers: [AuthController],
      providers: [
        AuthService,
        { provide: JwtService, useValue: { sign: jest.fn(() => 'jwt-token-test') } },
      ],
    }).compile()

    app = module.createNestApplication()
    app.setGlobalPrefix('api')
    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    jest.clearAllMocks()
    mockFindUnique.mockImplementation(
      ({ where }: { where: { id?: string; email?: string } }) => {
        if (where.email === adminUser.email || where.id === adminUser.id) return adminUser
        return null
      },
    )
    mockSessionCreate.mockResolvedValue({
      id: 'sess-1', token: 'test', employeeId: 'emp-1',
      expiresAt: new Date(), createdAt: new Date(),
    })
  })

  it('deve autenticar admin@sig.com com admin123 e retornar token + employee', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'admin@sig.com', password: 'admin123' })
      .expect(201)

    expect(res.body.token).toBe('jwt-token-test')
    expect(res.body.employee.email).toBe('admin@sig.com')
    expect(res.body.employee.role).toBe('ADMIN')
  })

  it('deve rejeitar senha incorreta', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'admin@sig.com', password: 'senha-errada' })
      .expect(401)

    expect(res.body.message).toBe('Invalid credentials')
  })

  it('deve rejeitar email inexistente', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'naoexiste@sig.com', password: 'admin123' })
      .expect(401)

    expect(res.body.message).toBe('Invalid credentials')
  })

  it('deve rejeitar colaborador inativo', async () => {
    mockFindUnique.mockResolvedValue({ ...adminUser, active: false })

    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'admin@sig.com', password: 'admin123' })
      .expect(401)

    expect(res.body.message).toBe('Invalid credentials')
  })

  it('deve rejeitar requisição sem email', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ password: 'admin123' })
      .expect(401)

    expect(res.body.message).toBe('Invalid credentials')
  })
})
