import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { UserEntity } from '../../../database/entities/user.entity';
import { RegisterDto } from './dtos/Register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async validateUser(email: string, password: string): Promise<UserEntity | null> {
    const user = await this.usersService.findByEmail(email);
    if (!user) return null;

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) return null;

    return user;
  }

  async login(user: UserEntity) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async validateOAuthLogin(profile: any): Promise<string> {
    const payload = {
      email: profile.emails[0].value,
      name: profile.displayName,
      provider: profile.provider,
    };

    return this.jwtService.sign(payload);
  }

  async validateGoogleUser(googleUser: any) {
    const user = await this.usersService.findByEmail(googleUser.email);
    if (!user) {
      throw new UnauthorizedException('Usuario no registrado con Google');
    }
    return user;
  }

  async registerWithEmail(registerDto: RegisterDto) {
    const { email, password, name } = registerDto;

    let user = await this.usersService.findByEmail(email);
    if (user) {
      throw new Error('El correo ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user = await this.usersService.createUser({
      email,
      name,
      password: hashedPassword,
      authProvider: 'LOCAL',
    });

    return user;
  }

  async registerGoogleUser(googleUser: any) {
    let user = await this.usersService.findByEmail(googleUser.email);
    const name = googleUser.displayName || googleUser.emails[0].value.split('@')[0];
    console.log('Google User:', googleUser);
    if (!user) {
      user = await this.usersService.createUser({
        email: googleUser.email,
        name: name,
        authProvider: 'GOOGLE',
      });
    }
    return user;
  }

  async findOrCreateGoogleUser(googleUser: any) {
    let user = await this.usersService.findByEmail(googleUser.email);
    if (!user) {
      user = await this.usersService.createUser({
        email: googleUser.email,
        name: googleUser.firstName + ' ' + googleUser.lastName,
        authProvider: 'GOOGLE',
      });
    }

    return user;
  }
}
