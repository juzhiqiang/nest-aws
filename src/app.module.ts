import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { StaticModule } from './static/static.module';

@Module({
  imports: [PrismaModule, UsersModule, StaticModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
