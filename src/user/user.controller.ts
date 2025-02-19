import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { User } from 'src/schemas/user.schema';
import { CreateUserDtoType, CreateUserSchema } from './dto/create-user.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  @UsePipes(new ZodValidationPipe(CreateUserSchema))
  async createUser(@Body() body: CreateUserDtoType) {
    return this.userService.create(body);
  }

  @Get('users-to-begin-conversation')
  @UseGuards(JwtAuthGuard)
  async listAll(@CurrentUser() user: User) {
    const findUser = await this.userService.findUsersToBeginConversation(
      user.userId,
    );
    return findUser;
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: User) {
    const findUser = await this.userService.findMe(user.userId);
    return findUser;
  }
}
