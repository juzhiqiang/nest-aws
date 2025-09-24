import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGithubUserDto } from './dto/create-github-user.dto';

@Injectable()
export class GithubService {
  constructor() {}

  async create(createGithubUserDto: CreateGithubUserDto) {
    const githubInfo = await this.fetchGithubUser(createGithubUserDto.github_token);
    return githubInfo;
    // return this.prisma.github_users.create({
    //   data: {
    //     github_token: createGithubUserDto.github_token,
    //     github_username: githubInfo.login,
    //     github_id: githubInfo.id,
    //     avatar_url: githubInfo.avatar_url,
    //     name: githubInfo.name,
    //     email: githubInfo.email,
    //     bio: githubInfo.bio,
    //   },
    // });
  }

  async findAll() {
    // return this.prisma.github_users.findMany({
    //   select: {
    //     id: true,
    //     github_username: true,
    //     github_id: true,
    //     avatar_url: true,
    //     name: true,
    //     email: true,
    //     bio: true,
    //     createdat: true,
    //     updatedat: true,
    //   },
    // });
  }

  async remove(id: number) {
    // return this.prisma.github_users.delete({
    //   where: { id },
    // });
  }

  private async fetchGithubUser(token: string) {
    try {
      const response = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Failed to fetch GitHub user: ${error.message}`);
    }
  }
}