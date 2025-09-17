import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHome() {
    return {
      title: 'Welcome to NestJS',
      message: 'Hello World!',
      users: [
        { name: 'John', age: 30, active: true },
        { name: 'Jane', age: 25, active: false },
        { name: 'Bob', age: 35, active: true },
      ],
      currentTime: new Date().toLocaleString(),
    };
  }
}
