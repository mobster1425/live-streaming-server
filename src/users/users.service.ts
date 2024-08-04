import { Injectable } from '@nestjs/common';



/**
 * Represents a user in the system
 */
export type User = {
  id: number;
  username: string;
  password: string;
};




/**
 * Service for managing user data
 */
@Injectable()
export class UsersService {
  // In-memory user storage. In a production environment, this would be replaced with a database.
  private readonly users: User[] = [];


  
  /**
   * Finds a user by their username
   * @param username - The username to search for
   * @returns The user object if found, undefined otherwise
   */
  async findOne(username: string): Promise<User | undefined> {
    return this.users.find(user => user.username === username);
  }


  
  /**
   * Creates a new user
   * @param username - The username for the new user
   * @param password - The password for the new user
   * @returns The created user object
   */
  async create(username: string, password: string): Promise<User> {
    const newUser: User = {
      id: this.users.length + 1,
      username,
      password,
    };
    this.users.push(newUser);
    return newUser;
  }


  
  /**
   * Updates a user's password
   * @param username - The username of the user to update
   * @param newPassword - The new password
   */
  async updatePassword(username: string, newPassword: string): Promise<void> {
    const user = this.users.find(user => user.username === username);
    if (user) {
      user.password = newPassword;
    }
  }
}