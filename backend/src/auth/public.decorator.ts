import { SetMetadata } from '@nestjs/common';

export const PUBLIC_ROUTE_KEY = 'isPublic';

/**
 * Mark a controller or route as public — bypasses SupabaseAuthGuard.
 * Use sparingly (e.g. /health).
 */
export const Public = () => SetMetadata(PUBLIC_ROUTE_KEY, true);
