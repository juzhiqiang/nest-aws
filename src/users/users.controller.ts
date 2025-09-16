import { Controller, Get } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getHello(): Promise<any> {
    return await this.usersService.findAll(1,10);
  }
}
