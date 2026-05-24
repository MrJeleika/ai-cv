import { Module } from '@nestjs/common';
import { JobController } from './job/job.controller';
import { JobService } from './job/job.service';
import { AiModule } from './ai.module';
import { ProfileModule } from './profile/profile.module';

@Module({
  imports: [AiModule, ProfileModule],
  controllers: [JobController],
  providers: [JobService],
  exports: [JobService],
})
export class JobModule {}
