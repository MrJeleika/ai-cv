import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import {
  JWTPayload,
  createRemoteJWKSet,
  jwtVerify,
  type JWTVerifyGetKey,
} from 'jose';
import { PUBLIC_ROUTE_KEY } from './public.decorator';

export interface AuthedUser {
  id: string;
  email?: string;
}

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  private readonly logger = new Logger(SupabaseAuthGuard.name);
  private jwks: JWTVerifyGetKey | null = null;
  private issuer: string | null = null;

  constructor(private readonly reflector: Reflector) {}

  private ensureJwks(): { jwks: JWTVerifyGetKey; issuer: string } {
    if (this.jwks && this.issuer) {
      return { jwks: this.jwks, issuer: this.issuer };
    }
    const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/+$/, '');
    if (!supabaseUrl) {
      throw new Error('SUPABASE_URL is not configured');
    }
    this.issuer = `${supabaseUrl}/auth/v1`;
    this.jwks = createRemoteJWKSet(
      new URL(`${supabaseUrl}/auth/v1/.well-known/jwks.json`),
    );
    return { jwks: this.jwks, issuer: this.issuer };
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      PUBLIC_ROUTE_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (isPublic) return true;

    const req = context.switchToHttp().getRequest<Request>();
    const auth = req.headers['authorization'];
    if (!auth?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing bearer token');
    }
    const token = auth.slice('Bearer '.length).trim();

    let payload: JWTPayload;
    try {
      const { jwks, issuer } = this.ensureJwks();
      const result = await jwtVerify(token, jwks, { issuer });
      payload = result.payload;
    } catch (err) {
      this.logger.warn(
        `JWT verification failed: ${err instanceof Error ? err.message : 'unknown'}`,
      );
      throw new UnauthorizedException('Invalid token');
    }

    const sub = payload.sub;
    if (!sub || typeof sub !== 'string') {
      throw new UnauthorizedException('Token missing sub');
    }
    (req as Request & { user: AuthedUser }).user = {
      id: sub,
      email: typeof payload.email === 'string' ? payload.email : undefined,
    };
    return true;
  }
}
