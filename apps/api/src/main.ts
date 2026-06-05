import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { NestExpressApplication } from '@nestjs/platform-express'
import { join } from 'path'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)

  app.setGlobalPrefix('api')
  app.enableCors()
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }))
  app.set('trust proxy', 1)
  app.useStaticAssets(join(__dirname, '..', 'uploads'), { prefix: '/uploads/' })

  const port = process.env.PORT ?? 3001
  await app.listen(port)
  console.log(`API running on http://localhost:${port}`)
}
bootstrap()
