import { Injectable } from '@nestjs/common';

export type User = {
  id: number;
  username: string;
  password: string;
};

@Injectable()
export class UsersService {
  private readonly users: User[] = [];

  async findOne(username: string): Promise<User | undefined> {
    return this.users.find(user => user.username === username);
  }

  async create(username: string, password: string): Promise<User> {
    const newUser: User = {
      id: this.users.length + 1,
      username,
      password,
    };
    this.users.push(newUser);
    return newUser;
  }

  async updatePassword(username: string, newPassword: string): Promise<void> {
    const user = this.users.find(user => user.username === username);
    if (user) {
      user.password = newPassword;
    }
  }
}