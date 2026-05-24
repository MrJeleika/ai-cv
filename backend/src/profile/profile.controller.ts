import { Body, Controller, Get, Post, Put } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthedUser } from '../auth/supabase-auth.guard';
import { ProfileService, ProfileUpdate } from './profile.service';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profile: ProfileService) {}

  @Get()
  async get(@CurrentUser() user: AuthedUser) {
    return this.profile.get(user.id);
  }

  @Put()
  async update(
    @CurrentUser() user: AuthedUser,
    @Body() patch: ProfileUpdate,
  ) {
    return this.profile.update(user.id, patch);
  }

  @Post('complete')
  async complete(@CurrentUser() user: AuthedUser) {
    return this.profile.complete(user.id);
  }
}
