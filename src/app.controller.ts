import { Controller, Get, Head } from '@nestjs/common';
import { AppService } from './app.service';



/**
 * Main application controller
 */
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  
  /**
   * Handles GET and HEAD requests to the root endpoint
   * @returns A greeting message from the AppService
   */
  @Get()
  @Head()
  getHello(): string {
    return this.appService.getHello();
  }
}