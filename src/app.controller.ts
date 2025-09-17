import { Controller, Get, Render } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Render('index.html') // 直接指定 .html 文件
  getHome() {
    return {
      title: 'Welcome to NestJS',
      message: 'Hello World! 123',
      users: [
        { name: 'John', age: 30, active: true },
        { name: 'Jane', age: 25, active: false },
        { name: 'Bob', age: 35, active: true },
      ],
      currentTime: new Date().toLocaleString(),
    };
  }
}
