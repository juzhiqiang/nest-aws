import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { GithubModule } from './github/github.module';

@Module({
  imports: [PrismaModule, UsersModule, GithubModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
