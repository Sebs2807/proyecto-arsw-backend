import { Controller, Get, UseGuards, Req, Post, Body, Res } from '@nestjs/common';
import express from 'express';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/Login.dto';
import { RegisterDto } from './dtos/Register.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from './jwt-auth.guar';

@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  // --- LOGIN ---
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res() res: express.Response) {
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const token = this.jwtService.sign({ id: user.id, email: user.email });

    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 días
    });

    return res.json({ message: 'Login exitoso', user: { id: user.id, email: user.email } });
  }

  // --- REGISTER ---
  @Post('register')
  async register(@Body() registerDto: RegisterDto, @Res() res: express.Response) {
    const user = await this.authService.registerWithEmail(registerDto);

    const token = this.jwtService.sign({ id: user.id, email: user.email });

    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    return res.json({ message: 'Registro exitoso', user: { id: user.id, email: user.email } });
  }

  // --- GOOGLE AUTH ---
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: express.Request, @Res() res: express.Response) {
    const user = req.user;
    if (!user) {
      return res.status(400).send('No se pudo autenticar');
    }

    const token = this.jwtService.sign(user as object);

    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    return res.redirect(`https://localhost:5173/dashboard`);
  }

  // --- PROFILE ---
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req) {
    return req.user;
  }
}
