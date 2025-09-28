// 专用于aws sam部署，main用于本地环境保持分离干净
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  ExpressAdapter,
  NestExpressApplication,
} from '@nestjs/platform-express';
import express from 'express';
import { Handler, Context, APIGatewayProxyEvent } from 'aws-lambda';
// 使用serverless-http替代aws-serverless-express
import serverless from 'serverless-http';

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

    app.useStaticAssets(join(__dirname,  'assets'), {
      prefix: `/static/`, // 明确指定前缀
    });

    // 配置模板目录
    app.setBaseViewsDir(join(__dirname,  'views'));

    // 配置 Nunjucks 引擎
    nunjucks.configure(join(__dirname,  'views'), {
      autoescape: true,
      express: app.getHttpAdapter().getInstance(),
      watch: false, // 在Lambda中禁用文件监控
      noCache: false, // 启用缓存以提高性能
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

    // 创建 serverless 处理器
    cachedServer = serverless(expressApp);
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
    return await server(event, context);
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
