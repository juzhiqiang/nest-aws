import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as nunjucks from 'nunjucks';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 设置全局API前缀，排除根路径
  app.setGlobalPrefix('api', {
    exclude: ['/'],
  });

  app.useStaticAssets(join(__dirname, '..', '..', 'assets'), {
    prefix: '/static/', // 明确指定前缀
  });

  // 配置模板目录
  app.setBaseViewsDir(join(__dirname, '..', '..', 'views'));


  // 配置 Nunjucks 引擎
  nunjucks.configure(join(__dirname, '..', '..', 'views'), {
    autoescape: true,
    express: app.getHttpAdapter().getInstance(),
    watch: true,
    noCache: true,
  });

  // 设置模板引擎为 html
  app.setViewEngine('html');
  
  // History API Fallback 中间件，除这个方案还可以使用路由守卫来做
  app.use((req, res, next) => {
    // 排除 API 和静态资源路径
    if (req.url.startsWith('/api') || req.url.startsWith('/static')) {
      return next();
    }

    // 如果请求的是文件（有扩展名），继续处理
    if (req.url.includes('.')) {
      return next();
    }

    // 其他所有请求重定向到根路径
    req.url = '/';
    next();
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
