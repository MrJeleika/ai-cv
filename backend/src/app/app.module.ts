import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JobModule } from '../job.module';
import { SupabaseModule } from '../supabase/supabase.module';
import { AuthModule } from '../auth/auth.module';
import { ProfileModule } from '../profile/profile.module';
import { ResumesModule } from '../resumes/resumes.module';
import { CoverLettersModule } from '../cover-letters/cover-letters.module';

@Module({
  imports: [
    SupabaseModule,
    AuthModule,
    ProfileModule,
    ResumesModule,
    CoverLettersModule,
    JobModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
