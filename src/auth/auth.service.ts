import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';




/**
 * Service handling authentication logic
 */
@Injectable()
export class AuthService {
  // In-memory token storage. In production,we will consider using a more robust solution.
  private tokens: Map<string, { userId: number; username: string }> = new Map();

  constructor(private usersService: UsersService) {}


  
  /**
   * Validates user credentials
   * @param username - The username to validate
   * @param password - The password to validate
   * @returns User object if credentials are valid, null otherwise
   */
  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findOne(username);
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }


  
  /**
   * Logs in a user and generates a token
   * @param user - The authenticated user object
   * @returns Object containing the access token
   */
  async login(user: any) {
    const token = crypto.randomBytes(64).toString('hex');
    this.tokens.set(token, { userId: user.id, username: user.username });
    return {
      access_token: token,
    };
  }


  /**
   * Registers a new user
   * @param username - The username for the new user
   * @param password - The password for the new user
   * @returns The created user object
   */

  async register(username: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    return this.usersService.create(username, hashedPassword);
  }


  
  /**
   * Validates a token
   * @param token - The token to validate
   * @returns User information if token is valid, undefined otherwise
   */
  validateToken(token: string) {
    return this.tokens.get(token);
  }

  
  /**
   * Removes a token (e.g., on logout)
   * @param token - The token to remove
   */
  removeToken(token: string) {
    this.tokens.delete(token);
  }
}