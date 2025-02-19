import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';
import { LoginUserDtoType, loginUserSchema } from 'src/user/dto/login-user.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UsePipes(new ZodValidationPipe(loginUserSchema))
  async login(@Body() body: LoginUserDtoType) {
    const { email, password } = body;
    const user = await this.authService.validateUser(email, password);
    const token = await this.authService.login(user);
    return { access_token: token, user: user };
  }
}
