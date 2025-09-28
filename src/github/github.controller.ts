import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Render,
} from '@nestjs/common';
import { GithubService } from './github.service';
import { CreateGithubUserDto } from './dto/create-github-user.dto';
import { CreateManualUserDto } from './dto/create-manual-user.dto';

@Controller('github')
export class GithubController {
  constructor(private readonly githubService: GithubService) {}

  @Get()
  @Render('github-form.html')
  showForm() {
    return {
      stagePrefix: process.env.STAGE ? `/${process.env.STAGE}` : null,
    };
  }

  @Get('list')
  async findAll() {
    return await this.githubService.findAll();
  }

  @Post()
  async create(@Body() createGithubUserDto: CreateGithubUserDto) {
    return await this.githubService.create(createGithubUserDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.githubService.remove(+id);
  }

  @Post('manual')
  async createManual(@Body() createManualUserDto: CreateManualUserDto) {
    return await this.githubService.createManual(createManualUserDto);
  }
}
