import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
	@Get('google')
	@UseGuards(AuthGuard('google'))
	async googleAuth(@Req() req) {
	}

	@Get('google/callback')
	@UseGuards(AuthGuard('google'))
	async googleAuthRedirect(@Req() req) {
		return {
			message: 'Login con Google exitoso',
			user: req.user,
		};
	}
}
