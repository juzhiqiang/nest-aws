// 专用于aws sam部署，main用于本地环境保持分离干净
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  ExpressAdapter,
  NestExpressApplication,
} from '@nestjs/platform-express';
import express from 'express';
import { Handler, Context, APIGatewayProxyEvent } from 'aws-lambda';
// nestjs 官方推荐，也可以使用serverless-http
import { createServer, proxy } from 'aws-serverless-express';

let cachedServer: any;

async function createNestApp() {
  if (!cachedServer) {
    // 创建 Express 实例
    const expressApp = express();
    const adapter = new ExpressAdapter(expressApp);

    // 创建 NestJS 应用
    const app = await NestFactory.create<NestExpressApplication>(
      AppModule,
      adapter,
    );

    // 启用 CORS
    app.enableCors();

    // 设置全局API前缀，排除根路径和github路径
    app.setGlobalPrefix('api', {
      exclude: ['/', 'github', 'github/*'],
    });

    // 配置静态资源和模板
    const { join } = require('path');
    const nunjucks = require('nunjucks');

    app.useStaticAssets(join(__dirname, 'assets'), {
      prefix: '/static/',
    });

    app.setBaseViewsDir(join(__dirname, 'views'));

    nunjucks.configure(join(__dirname, 'views'), {
      autoescape: true,
      express: expressApp,
      watch: false,
      noCache: true,
    });

    app.setViewEngine('html');

    // 初始化应用
    await app.init();

    // History API Fallback 中间件，除这个方案还可以使用路由守卫来做
    expressApp.use((req, res, next) => {
      // 排除 API 和静态资源路径
      if (
        req.url.startsWith('/api') ||
        req.url.startsWith('/static') ||
        req.url.startsWith('/github')
      ) {
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

    // 创建 serverless express 服务器
    cachedServer = createServer(expressApp);
  }

  return cachedServer;
}

// Lambda 处理函数
export const handler: Handler = async (
  event: APIGatewayProxyEvent,
  context: Context,
): Promise<any> => {
  // 设置 context 不等待事件循环为空
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    const server = await createNestApp();
    return await proxy(server, event, context, 'PROMISE').promise;
  } catch (error) {
    console.error('Lambda handler error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal Server Error',
        message: error.message,
      }),
    };
  }
};

// 预热函数（可选）
export const warmup: Handler = async (event: any) => {
  if (event.source === 'aws.events' || event.detail?.source === 'warmup') {
    console.log('Lambda warming up...');
    await createNestApp();
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Lambda warmed up successfully' }),
    };
  }

  // 如果不是预热事件，正常处理
  return handler(event as APIGatewayProxyEvent, {} as Context);
};
