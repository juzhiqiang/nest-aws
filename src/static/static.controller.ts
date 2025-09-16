import { Controller, Get, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { join } from 'path';

@Controller('static')
export class StaticController {
  @Get()
  getIndex(@Res() res: Response) {
    return res.sendFile(join(__dirname, '..', '..', 'public', 'index.html'));
  }

  @Get(':filename')
  getStaticFile(@Param('filename') filename: string, @Res() res: Response) {
    return res.sendFile(join(__dirname, '..', '..', 'public', filename));
  }
}