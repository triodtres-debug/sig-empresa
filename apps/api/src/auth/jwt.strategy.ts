import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { prisma } from '@sig/database'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET ?? 'dev-secret-change-in-production',
    })
  }

  async validate(payload: { sub: string; role: string }) {
    if (!payload?.sub) throw new UnauthorizedException()
    const employee = await prisma.employee.findUnique({ where: { id: payload.sub }, select: { id: true, active: true } })
    if (!employee || !employee.active) throw new UnauthorizedException()
    return { sub: payload.sub, role: payload.role }
  }
}
