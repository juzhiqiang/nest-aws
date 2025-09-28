// src/prisma/prisma.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService implements OnModuleInit {
  private writeClient: PrismaClient;
  private readClient: PrismaClient;

  constructor() {
    // 写库连接
    this.writeClient = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });

    // 读库连接
    this.readClient = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_READ_URL || process.env.DATABASE_URL,
        },
      },
    });
  }

  async onModuleInit() {
    try {
      if (this.writeClient.$connect) {
        await this.writeClient.$connect();
      }
      if (this.readClient.$connect) {
        await this.readClient.$connect();
      }
    } catch (error) {
      console.warn('Prisma connection failed:', error.message);
    }
  }

  // 获取写库客户端
  get writer() {
    return this.writeClient;
  }

  // 获取读库客户端
  get reader() {
    return this.readClient;
  }

  // 为了向后兼容，默认使用写库
  get github_users() {
    return this.writeClient.github_users;
  }

  get users() {
    return this.writeClient.users;
  }
}
