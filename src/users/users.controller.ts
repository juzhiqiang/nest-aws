import { Controller, Get } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("users")
  async getHello(): Promise<any> {
    return await this.usersService.findAll(1,10);
  }
}
