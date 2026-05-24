import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthedUser } from './supabase-auth.guard';

/**
 * Inject the authenticated user (set by SupabaseAuthGuard) into a controller method.
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthedUser => {
    const req = ctx.switchToHttp().getRequest();
    return req.user as AuthedUser;
  },
);
