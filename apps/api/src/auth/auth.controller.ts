import { Controller, Post, Get, Body, UseGuards, Req, Inject } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { AuthService } from './auth.service'

@Controller('auth')
export class AuthController {
  constructor(@Inject(AuthService) private auth: AuthService) {}

  @Post('login')
  login(@Body() body: { email: string; password: string }, @Req() req: any) {
    return this.auth.login(body.email, body.password, { ip: req.ip, userAgent: req.headers?.['user-agent'] })
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  me(@Req() req: any) {
    return this.auth.me(req.user.sub)
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('permissions')
  myPermissions(@Req() req: any) {
    return this.auth.myPermissions(req.user.sub)
  }
}
