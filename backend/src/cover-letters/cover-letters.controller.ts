import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthedUser } from '../auth/supabase-auth.guard';
import {
  CoverLetterCreate,
  CoverLetterUpdate,
  CoverLettersService,
} from './cover-letters.service';
import { JobService } from '../job/job.service';

@Controller('cover-letters')
export class CoverLettersController {
  constructor(
    private readonly letters: CoverLettersService,
    private readonly jobService: JobService,
  ) {}

  @Get()
  list(@CurrentUser() user: AuthedUser, @Query('limit') limit?: string) {
    return this.letters.list(user.id, limit ? Number(limit) : undefined);
  }

  @Get(':id')
  get(@CurrentUser() user: AuthedUser, @Param('id') id: string) {
    return this.letters.get(user.id, id);
  }

  @Post()
  create(@CurrentUser() user: AuthedUser, @Body() body: CoverLetterCreate) {
    return this.letters.create(user.id, body);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthedUser,
    @Param('id') id: string,
    @Body() patch: CoverLetterUpdate,
  ) {
    return this.letters.update(user.id, id, patch);
  }

  @Delete(':id')
  async remove(@CurrentUser() user: AuthedUser, @Param('id') id: string) {
    await this.letters.remove(user.id, id);
    return { ok: true };
  }

  @Get(':id/pdf')
  async pdf(
    @CurrentUser() user: AuthedUser,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const row = await this.letters.get(user.id, id);
    const text = row.edited_text ?? row.body_text ?? '';
    const buf = await this.jobService.generateCoverLetterPDF(
      text,
      row.company ?? '',
    );
    const filename = `cover-letter-${(row.company ?? 'letter').replace(/\s+/g, '-')}.pdf`;
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buf.length.toString(),
    });
    res.end(buf);
  }
}
