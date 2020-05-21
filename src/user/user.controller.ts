import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { UserService } from './user.service';
import { User, CreateUserInput } from './user.entity';

@Controller('user')
export class UserController {
  constructor(private readonly service: UserService) {}

  @Get(':id')
  async findById(@Param() params): Promise<User> {
    return this.service.byId(params.id);
  }

  @Post()
  async create(@Body() payload: CreateUserInput): Promise<User> {
    return this.service.createUser(payload);
  }
}
