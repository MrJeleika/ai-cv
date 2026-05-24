import { Module } from '@nestjs/common';
import { AiService } from './ai/ai.service';
import { SkillsService } from './ai/skills.service';

@Module({
  providers: [AiService, SkillsService],
  exports: [AiService, SkillsService],
})
export class AiModule {}
