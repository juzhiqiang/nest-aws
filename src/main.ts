import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as nunjucks from 'nunjucks';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useStaticAssets(join(__dirname, '..', 'public'), {
    prefix: '/static/', // 明确指定前缀
  });

  // 配置模板目录
  app.setBaseViewsDir(join(__dirname, '..', 'views'));

  // 设置模板引擎为 html
  app.setViewEngine('html');

  // 配置 Nunjucks 引擎
  nunjucks.configure(join(__dirname, '..', 'views'), {
    autoescape: true,
    express: app.getHttpAdapter().getInstance(),
    watch: true,
    noCache: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
