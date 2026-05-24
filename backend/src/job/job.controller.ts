import {
  Controller,
  Post,
  Body,
  Res,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { JobService } from './job.service';
import { AiService, CoverLetterRequest, CVRequest } from '../ai/ai.service';
import { ProfileService } from '../profile/profile.service';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthedUser } from '../auth/supabase-auth.guard';

@Controller('job')
export class JobController {
  constructor(
    private readonly jobService: JobService,
    private readonly aiService: AiService,
    private readonly profileService: ProfileService,
  ) {}

  // =========================================================================
  // Cover letter
  // =========================================================================

  @Post('cover-letter/preview')
  async previewCoverLetter(
    @CurrentUser() user: AuthedUser,
    @Body() request: CoverLetterRequest,
  ) {
    requireCoverLetterFields(request);
    const profile = await this.profileService.get(user.id);
    const text = await this.aiService.generateCoverLetter(request, profile);
    return { text };
  }

  @Post('cover-letter')
  async generateCoverLetter(
    @CurrentUser() user: AuthedUser,
    @Body() request: CoverLetterRequest,
    @Res() res: Response,
  ) {
    requireCoverLetterFields(request);
    const profile = await this.profileService.get(user.id);
    const text = await this.aiService.generateCoverLetter(request, profile);
    const pdfBuffer = await this.jobService.generateCoverLetterPDF(
      text,
      request.companyName,
    );
    sendPdf(
      res,
      pdfBuffer,
      `cover-letter-${slug(request.companyName)}.pdf`,
    );
  }

  @Post('cover-letter/custom')
  async generateCustomCoverLetter(
    @Body() request: { text: string; companyName: string },
    @Res() res: Response,
  ) {
    if (!request.text || !request.companyName) {
      throw new HttpException(
        'Text and company name are required',
        HttpStatus.BAD_REQUEST,
      );
    }
    const pdfBuffer = await this.jobService.generateCustomCoverLetterPDF(
      request.text,
      request.companyName,
    );
    sendPdf(
      res,
      pdfBuffer,
      `cover-letter-${slug(request.companyName)}.pdf`,
    );
  }

  // =========================================================================
  // CV
  // =========================================================================

  @Post('cv/preview')
  async previewCV(
    @CurrentUser() user: AuthedUser,
    @Body() request: CVRequest,
  ) {
    requireCvFields(request);
    const profile = await this.profileService.get(user.id);
    return this.aiService.generateCV(request, profile);
  }

  @Post('cv')
  async generateCV(
    @CurrentUser() user: AuthedUser,
    @Body() request: CVRequest,
    @Res() res: Response,
  ) {
    requireCvFields(request);
    const profile = await this.profileService.get(user.id);
    const cvData = await this.aiService.generateCV(request, profile);
    const pdfBuffer = await this.jobService.generateCVPDF(cvData, profile);
    sendPdf(
      res,
      pdfBuffer,
      `cv-${slug(request.targetRole || 'general')}.pdf`,
    );
  }
}

function requireCoverLetterFields(req: CoverLetterRequest) {
  if (!req.jobTitle || !req.companyName || !req.jobDescription) {
    throw new HttpException(
      'jobTitle, companyName, and jobDescription are required',
      HttpStatus.BAD_REQUEST,
    );
  }
}

function requireCvFields(req: CVRequest) {
  if (!req.targetRole || !req.jobDescription) {
    throw new HttpException(
      'targetRole and jobDescription are required',
      HttpStatus.BAD_REQUEST,
    );
  }
}

function slug(s: string): string {
  return s.replace(/\s+/g, '-');
}

function sendPdf(res: Response, buf: Buffer, filename: string) {
  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="${filename}"`,
    'Content-Length': buf.length.toString(),
  });
  res.end(buf);
}
