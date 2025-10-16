import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { Logger } from '@nestjs/common';
import { UsersDBService } from 'src/database/dbservices/users.dbservice';
import { UserEntity } from 'src/database/entities/user.entity';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { UsersWorkspacesService } from '../users-workspaces/usersworkspaces.service';
import { Role } from 'src/database/entities/userworkspace.entity';

interface GoogleUserPayload {
  email: string;
  firstName: string;
  lastName: string;
  picture: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly userDbService: UsersDBService,
    private readonly workspacesService: WorkspacesService,
    private readonly usersWorkspacesService: UsersWorkspacesService,
  ) {}

  async validateGoogleUser(googleUser: GoogleUserPayload): Promise<UserEntity> {
    const user = await this.usersService.findByEmail(googleUser.email);
    if (!user) {
      throw new UnauthorizedException('Usuario no registrado con Google');
    }
    return user;
  }

  async loginOrCreateGoogleUser(
    email: string,
    firstName: string,
    lastName: string,
    picture: string,
    googleRefreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      let user = await this.usersService.findByEmail(email);

      console.log('refesh token in loginOrCreateGoogleUser:', googleRefreshToken);

      if (!user) {
        this.logger.log(`Creating new user with email: ${email}`);

        user = await this.usersService.createUser({
          email,
          firstName,
          lastName,
          picture,
          googleRefreshToken,
        });

        const firstWorkspace = await this.workspacesService.createWorkspace(
          firstName + "'s Workspace",
        );

        await this.usersWorkspacesService.addUserToWorkspace(
          user.id,
          firstWorkspace.id,
          Role.SUPER_ADMIN,
        );

        const accessToken = this.jwtService.sign(
          { id: user.id, email: user.email },
          { secret: process.env.JWT_ACCESS_SECRET, expiresIn: '1h' },
        );

        const refreshToken = this.jwtService.sign(
          { id: user.id, email: user.email },
          { secret: process.env.JWT_REFRESH_SECRET, expiresIn: '7d' },
        );

        user.JWTRefreshToken = refreshToken;
        await this.userDbService.repository.save(user);

        return { accessToken, refreshToken };
      } else {
        this.logger.log(`Found existing user with email: ${email}`);

        const accessToken = this.jwtService.sign(
          { id: user.id, email: user.email },
          { secret: process.env.JWT_ACCESS_SECRET, expiresIn: '1h' },
        );

        const refreshToken = await this.usersService.generateNewRefreshToken(user.id);

        return { accessToken, refreshToken };
      }
    } catch (err) {
      this.logger.error(
        `Error in loginOrCreateGoogleUser: ${(err as Error).message}`,
        (err as Error).stack,
      );
      throw err;
    }
  }

  async refreshAccessToken(
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken?: string }> {
    try {
      const payload = this.jwtService.verify<{ id: string; email: string }>(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      if (!payload?.id) {
        throw new UnauthorizedException('Refresh token inválido');
      }

      const user = await this.userDbService.findById(payload.id);
      if (!user || user.JWTRefreshToken !== refreshToken) {
        throw new UnauthorizedException('Refresh token inválido o expirado');
      }

      const newAccessToken = this.jwtService.sign(
        { id: user.id, email: user.email },
        { secret: process.env.JWT_ACCESS_SECRET, expiresIn: '1h' },
      );

      const newRefreshToken = this.jwtService.sign(
        { id: user.id, email: user.email },
        { secret: process.env.JWT_REFRESH_SECRET, expiresIn: '7d' },
      );

      user.JWTRefreshToken = newRefreshToken;
      await this.userDbService.repository.save(user);

      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (err) {
      const error = err as Error;
      this.logger.error(`Error refreshing token: ${error.message}`, error.stack);
      throw new UnauthorizedException('No se pudo refrescar el token');
    }
  }
}
