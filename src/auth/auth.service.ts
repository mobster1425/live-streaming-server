import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  private tokens: Map<string, { userId: number; username: string }> = new Map();

  constructor(private usersService: UsersService) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findOne(username);
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const token = crypto.randomBytes(64).toString('hex');
    this.tokens.set(token, { userId: user.id, username: user.username });
    return {
      access_token: token,
    };
  }

  async register(username: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    return this.usersService.create(username, hashedPassword);
  }

  validateToken(token: string) {
    return this.tokens.get(token);
  }

  removeToken(token: string) {
    this.tokens.delete(token);
  }
}