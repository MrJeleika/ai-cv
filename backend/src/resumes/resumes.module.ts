import { Module } from '@nestjs/common';
import { ResumesController } from './resumes.controller';
import { ResumesService } from './resumes.service';
import { ProfileModule } from '../profile/profile.module';
import { JobModule } from '../job.module';

@Module({
  imports: [ProfileModule, JobModule],
  controllers: [ResumesController],
  providers: [ResumesService],
  exports: [ResumesService],
})
export class ResumesModule {}
