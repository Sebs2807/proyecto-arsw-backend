import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
	constructor(private jwtService: JwtService) {}

	async validateOAuthLogin(profile: any): Promise<string> {
		const payload = {
			email: profile.emails[0].value,
			name: profile.displayName,
			provider: profile.provider,
		};

		return this.jwtService.sign(payload);
	}
}
