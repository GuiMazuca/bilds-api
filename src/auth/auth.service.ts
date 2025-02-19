import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  private privateKey: string;

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.privateKey = fs.readFileSync(
      configService.get<string>('JWT_PRIVATE_KEY'),
      'utf8',
    );
  }

  async validateUser(email: string, password: string) {
    const currentUser = await this.userService.findOneByEmail(email);
    if (!currentUser) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      currentUser.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return currentUser;
  }

  async login(user: any) {
    const payload = { sub: user._id, name: user.name };
    return this.jwtService.sign(payload, {
      algorithm: 'RS256',
      privateKey: this.privateKey,
    });
  }
}
