import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Inject, Req, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { extname, join } from 'path'
import { AuthGuard } from '@nestjs/passport'
import { EmployeesService } from './employees.service'
import { RequirePermission } from '../common/permission.decorator'
import { PermissionGuard } from '../common/permission.guard'

const MIME_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']

const photoStorage = diskStorage({
  destination: join(__dirname, '..', '..', 'uploads', 'avatars'),
  filename: (_req, file, cb) => {
    const name = `employee-${Date.now()}${extname(file.originalname)}`
    cb(null, name)
  },
})

function photoFileFilter(_req: any, file: Express.Multer.File, cb: (error: Error | null, acceptFile: boolean) => void) {
  if (MIME_TYPES.includes(file.mimetype)) return cb(null, true)
  cb(new BadRequestException(`Tipo de arquivo não permitido: ${file.mimetype}. Use PNG, JPEG, WebP ou GIF.`), false)
}

@UseGuards(AuthGuard('jwt'), PermissionGuard)
@Controller('employees')
export class EmployeesController {
  constructor(@Inject(EmployeesService) private service: EmployeesService) {}

  @Get()
  @RequirePermission('EMPLOYEES', 'VIEW')
  list() {
    return this.service.list()
  }

  @Get(':id')
  @RequirePermission('EMPLOYEES', 'VIEW')
  getById(@Param('id') id: string) {
    return this.service.getById(id)
  }

  @Post()
  @RequirePermission('EMPLOYEES', 'CREATE')
  create(@Body() body: { name: string; email: string; cpf: string; password: string; isAdmin?: boolean }) {
    return this.service.create(body)
  }

  @Patch(':id')
  @RequirePermission('EMPLOYEES', 'EDIT')
  update(@Param('id') id: string, @Body() body: { name?: string; email?: string; isAdmin?: boolean; active?: boolean }, @Req() req: any) {
    return this.service.update(id, body, req.user.sub)
  }

  @Delete(':id')
  @RequirePermission('EMPLOYEES', 'DELETE')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.service.remove(id, req.user.sub)
  }

  @Patch(':id/photo')
  @RequirePermission('EMPLOYEES', 'EDIT')
  @UseInterceptors(FileInterceptor('photo', { storage: photoStorage, fileFilter: photoFileFilter, limits: { fileSize: 2 * 1024 * 1024 } }))
  uploadPhoto(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File | undefined,
  ) {
    if (!file) throw new BadRequestException('Arquivo não enviado ou maior que 2MB.')
    return this.service.updatePhoto(id, file.filename)
  }

  @Delete(':id/photo')
  @RequirePermission('EMPLOYEES', 'EDIT')
  removePhoto(@Param('id') id: string) {
    return this.service.removePhoto(id)
  }
}
