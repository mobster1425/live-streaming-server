import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';


/**
 * Controller handling authentication-related HTTP requests
 */
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}


  /**
   * Handles user login
   * @param body - Contains username and password
   * @returns JWT token upon successful authentication
   * @throws UnauthorizedException if credentials are invalid
   */  
  @Post('login')
  async login(@Body() body: { username: string; password: string }) {
    const user = await this.authService.validateUser(body.username, body.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user);
  }


  
  /**
   * Handles user registration
   * @param body - Contains username and password for the new user
   * @returns The created user object
   */
  @Post('register')
  async register(@Body() body: { username: string; password: string }) {
    return this.authService.register(body.username, body.password);
  }
}