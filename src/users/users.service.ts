import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
// import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-users.dto';
import { UserResponse } from './dto/user-response.dto';
import { UpdateUserDto } from './dto/update-users.dto';
import { Users } from 'generated/prisma';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  /**
   * 创建新用户
   */
  //   async create(createUserDto: CreateUserDto): Promise<UserResponse> {
  //     const { email, name, password } = createUserDto;

  //     // 检查邮箱是否已存在
  //     const existingUser = await this.prisma.users.findUnique({
  //       where: { email },
  //     });

  //     if (existingUser) {
  //       throw new ConflictException('Email already exists');
  //     }

  //     // 加密密码
  //     const hashedPassword = await bcrypt.hash(password, 10);

  //     // 创建用户
  //     const user = await this.prisma.users.create({
  //       data: {
  //         email,
  //         name,
  //         password: hashedPassword,
  //       },
  //     });

  //     return this.excludePassword(user);
  //   }

  /**
   * 获取所有用户（分页）
   */
  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    users: UserResponse[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    // const skip = (page - 1) * limit;
    // const [users, total] = await Promise.all([
    //   this.prisma.users.findMany({
    //     skip,
    //     take: limit,
    //     orderBy: { createdAt: 'desc' },
    //   }),
    //   this.prisma.users.count(),
    // ]);

    // return {
    //   users: users.map(user => this.excludePassword(user)),
    //   total,
    //   page,
    //   totalPages: Math.ceil(total / limit),
    // };

    return {
      users: [],
      total: 10,
      page: 1,
      totalPages: Math.ceil(10 / 5),
    };
  }

  /**
   * 根据ID获取用户
   */
  // async findOne(id: number): Promise<UserResponse> {
  //   const user = await this.prisma.users.findUnique({
  //     where: { id },
  //   });

  //   if (!user) {
  //     throw new NotFoundException(`User with ID ${id} not found`);
  //   }

  //   return this.excludePassword(user);
  // }

  // /**
  //  * 根据邮箱获取用户（包含密码，用于登录验证）
  //  */
  // async findByEmail(email: string): Promise<Users | null> {
  //   return this.prisma.users.findUnique({
  //     where: { email },
  //   });
  // }

  // /**
  //  * 根据邮箱获取用户（不包含密码）
  //  */
  // async findByEmailPublic(email: string): Promise<UserResponse | null> {
  //   const user = await this.prisma.users.findUnique({
  //     where: { email },
  //   });

  //   return user ? this.excludePassword(user) : null;
  // }

  /**
   * 更新用户信息
   */
  //   async update(id: number, updateUserDto: UpdateUserDto): Promise<UserResponse> {
  //     // 检查用户是否存在
  //     const existingUser = await this.prisma.users.findUnique({
  //       where: { id },
  //     });

  //     if (!existingUser) {
  //       throw new NotFoundException(`User with ID ${id} not found`);
  //     }

  //     // 如果更新邮箱，检查邮箱是否已被其他用户使用
  //     if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
  //       const emailExists = await this.prisma.users.findUnique({
  //         where: { email: updateUserDto.email },
  //       });

  //       if (emailExists) {
  //         throw new ConflictException('Email already exists');
  //       }
  //     }

  //     // 准备更新数据
  //     const updateData: any = { ...updateUserDto };

  //     // 如果更新密码，先加密
  //     if (updateUserDto.password) {
  //       updateData.password = await bcrypt.hash(updateUserDto.password, 10);
  //     }

  //     // 更新用户
  //     const updatedUser = await this.prisma.users.update({
  //       where: { id },
  //       data: updateData,
  //     });

  //     return this.excludePassword(updatedUser);
  //   }

  /**
   * 删除用户
   */
  async remove(id: number): Promise<{ message: string }> {
    // 检查用户是否存在
    const existingUser = await this.prisma.users.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // 删除用户
    await this.prisma.users.delete({
      where: { id },
    });

    return { message: `User with ID ${id} has been deleted successfully` };
  }

  /**
   * 验证用户密码
   */
  //   async validatePassword(email: string, password: string): Promise<UserResponse | null> {
  //     const user = await this.findByEmail(email);

  //     if (!user) {
  //       return null;
  //     }

  //     const isPasswordValid = await bcrypt.compare(password, user.password);

  //     if (!isPasswordValid) {
  //       return null;
  //     }

  //     return this.excludePassword(user);
  //   }

  /**
   * 更改用户密码
   */
  //   async changePassword(id: number, oldPassword: string, newPassword: string): Promise<UserResponse> {
  //     const user = await this.prisma.users.findUnique({
  //       where: { id },
  //     });

  //     if (!user) {
  //       throw new NotFoundException(`User with ID ${id} not found`);
  //     }

  //     // 验证旧密码
  //     const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);

  //     if (!isOldPasswordValid) {
  //       throw new ConflictException('Old password is incorrect');
  //     }

  //     // 加密新密码
  //     const hashedNewPassword = await bcrypt.hash(newPassword, 10);

  //     // 更新密码
  //     const updatedUser = await this.prisma.users.update({
  //       where: { id },
  //       data: { password: hashedNewPassword },
  //     });

  //     return this.excludePassword(updatedUser);
  //   }

  /**
   * 搜索用户（按邮箱或姓名）
   */
  // async search(
  //   query: string,
  //   page: number = 1,
  //   limit: number = 10,
  // ): Promise<{
  //   users: UserResponse[];
  //   total: number;
  //   page: number;
  //   totalPages: number;
  // }> {
  //   const skip = (page - 1) * limit;

  //   const whereCondition = {
  //     OR: [
  //       { email: { contains: query, mode: 'insensitive' as const } },
  //       { name: { contains: query, mode: 'insensitive' as const } },
  //     ],
  //   };

  //   const [users, total] = await Promise.all([
  //     this.prisma.users.findMany({
  //       where: whereCondition,
  //       skip,
  //       take: limit,
  //       orderBy: { createdAt: 'desc' },
  //     }),
  //     this.prisma.users.count({ where: whereCondition }),
  //   ]);

  //   return {
  //     users: users.map((user) => this.excludePassword(user)),
  //     total,
  //     page,
  //     totalPages: Math.ceil(total / limit),
  //   };
  // }

  /**
   * 获取用户统计信息
   */
  // async getStats(): Promise<{
  //   totalUsers: number;
  //   usersToday: number;
  //   usersThisWeek: number;
  //   usersThisMonth: number;
  // }> {
  //   const now = new Date();
  //   const startOfDay = new Date(
  //     now.getFullYear(),
  //     now.getMonth(),
  //     now.getDate(),
  //   );
  //   const startOfWeek = new Date(
  //     startOfDay.getTime() - startOfDay.getDay() * 24 * 60 * 60 * 1000,
  //   );
  //   const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  //   const [totalUsers, usersToday, usersThisWeek, usersThisMonth] =
  //     await Promise.all([
  //       this.prisma.users.count(),
  //       this.prisma.users.count({
  //         where: { createdAt: { gte: startOfDay } },
  //       }),
  //       this.prisma.users.count({
  //         where: { createdAt: { gte: startOfWeek } },
  //       }),
  //       this.prisma.users.count({
  //         where: { createdAt: { gte: startOfMonth } },
  //       }),
  //     ]);

  //   return {
  //     totalUsers,
  //     usersToday,
  //     usersThisWeek,
  //     usersThisMonth,
  //   };
  // }

  // /**
  //  * 排除密码字段的辅助方法
  //  */
  // private excludePassword(user: Users): UserResponse {
  //   const { password, ...userWithoutPassword } = user;
  //   return userWithoutPassword;
  // }
}
