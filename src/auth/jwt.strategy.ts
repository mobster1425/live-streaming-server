import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { UsersService } from '../users/users.service';



/**
 * JWT Strategy for Passport authentication
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private logger = new Logger('JwtStrategy');

  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: (req) => {
        this.logger.debug('Extracting JWT from request');
        if (!req || !req.handshake) {
          this.logger.warn('No request or handshake found');
          return null;
        }
        let token = null;
        
        // Check in handshake auth
        if (req.handshake.auth && req.handshake.auth.token) {
          token = req.handshake.auth.token;
          this.logger.debug('Token found in handshake.auth');
        } 
        // Check in handshake headers
        else if (req.handshake.headers.authorization) {
          token = req.handshake.headers.authorization.split(' ')[1];
          this.logger.debug('Token found in authorization header');
        }
        // Check in handshake query
        else if (req.handshake.query && req.handshake.query.token) {
          token = req.handshake.query.token;
          this.logger.debug('Token found in query parameter');
        }

        if (!token) {
          this.logger.warn('No token found in request');
        } else {
          this.logger.debug('Token found:', token);
        }
        return token;
      },
      ignoreExpiration: false,
      secretOrKey: 'secret-key', // Replace with your actual secret key
    });
  }


  

  /**
   * Validates the payload of a JWT token
   * @param payload - The decoded JWT payload
   * @returns The user object if validation is successful
   * @throws UnauthorizedException if user is not found
   */
  async validate(payload: any) {
    this.logger.debug(`Validating payload: ${JSON.stringify(payload)}`);
    const user = await this.usersService.findOne(payload.username);
    if (!user) {
      this.logger.warn(`User not found for username: ${payload.username}`);
      throw new UnauthorizedException();
    }
    this.logger.debug(`User validated: ${user.username}`);
    return { userId: payload.sub, username: payload.username };
  }
}