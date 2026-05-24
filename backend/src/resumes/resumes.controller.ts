import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthedUser } from '../auth/supabase-auth.guard';
import { ResumesService, ResumeCreate } from './resumes.service';
import { ProfileService } from '../profile/profile.service';
import { JobService } from '../job/job.service';

@Controller('resumes')
export class ResumesController {
  constructor(
    private readonly resumes: ResumesService,
    private readonly profileService: ProfileService,
    private readonly jobService: JobService,
  ) {}

  @Get()
  list(@CurrentUser() user: AuthedUser, @Query('limit') limit?: string) {
    return this.resumes.list(user.id, limit ? Number(limit) : undefined);
  }

  @Get(':id')
  get(@CurrentUser() user: AuthedUser, @Param('id') id: string) {
    return this.resumes.get(user.id, id);
  }

  @Post()
  create(@CurrentUser() user: AuthedUser, @Body() body: ResumeCreate) {
    return this.resumes.create(user.id, body);
  }

  @Delete(':id')
  async remove(@CurrentUser() user: AuthedUser, @Param('id') id: string) {
    await this.resumes.remove(user.id, id);
    return { ok: true };
  }

  @Get(':id/pdf')
  async pdf(
    @CurrentUser() user: AuthedUser,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const row = await this.resumes.get(user.id, id);
    const profile = await this.profileService.get(user.id);
    const buf = await this.jobService.generateCVPDF(
      row.cv_json as Parameters<typeof this.jobService.generateCVPDF>[0],
      profile,
    );
    const filename = `cv-${(row.target_role ?? 'resume').replace(/\s+/g, '-')}.pdf`;
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buf.length.toString(),
    });
    res.end(buf);
  }
}
