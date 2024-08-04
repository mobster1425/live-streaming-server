import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { AuthService } from './auth.service';



/**
 * A simple authentication guard that uses tokens stored in the AuthService
 */
@Injectable()
export class SimpleAuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}


  
  /**
   * Determines if the current user can activate a route
   * @param context - The execution context
   * @returns true if the user is authenticated, false otherwise
   */
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      return false;
    }

      // Attach the user to the request object for use in controllers
    const user = this.authService.validateToken(token);
    if (!user) {
      return false;
    }
    request.user = user;
    return true;
  }

  
  /**
   * Extracts the JWT token from the request's Authorization header
   * @param request - The incoming request
   * @returns The extracted token, or undefined if not found
   */
  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}