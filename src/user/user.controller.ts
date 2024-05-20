import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AtGuard } from '../common/guards';
import { UserService } from './user.service';
import { GetCurrentUser } from '../common/decorators';

import {
  EditUserDto,
  FollowUnfollowDto,
  UserDto,
  UserFollowerDto,
  UserFollowingDto,
} from './dto';

@UseGuards(AtGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile/:id')
  @UsePipes(new ValidationPipe({ transform: true }))
  @HttpCode(HttpStatus.OK)
  getWithProfile(@Param('id') userId: string): Promise<UserDto> {
    return this.userService.getWithProfile(+userId);
  }

  @Get('followers')
  @UsePipes(new ValidationPipe({ transform: true }))
  @HttpCode(HttpStatus.OK)
  getFollowers(
    @GetCurrentUser('id') userId: number,
  ): Promise<UserFollowerDto[]> {
    return this.userService.getUserFollowers(userId);
  }

  @Get('following')
  @UsePipes(new ValidationPipe({ transform: true }))
  @HttpCode(HttpStatus.OK)
  getFollowings(
    @GetCurrentUser('id') userId: number,
  ): Promise<UserFollowingDto[]> {
    return this.userService.getUserFollowing(userId);
  }

  @Post('follow')
  follow(
    @GetCurrentUser('id') userId: number,
    @Body() dto: FollowUnfollowDto,
  ): Promise<void> {
    return this.userService.follow(userId, dto.followId);
  }

  @Post('unfollow')
  unfollow(
    @GetCurrentUser('id') userId: number,
    @Body() dto: FollowUnfollowDto,
  ): Promise<void> {
    return this.userService.unfollow(userId, dto.followId);
  }

  @Post('edit')
  @UsePipes(new ValidationPipe({ transform: true }))
  @HttpCode(HttpStatus.OK)
  edit(@GetCurrentUser('id') userId: number, @Body() dto: EditUserDto) {
    return this.userService.edit(userId, dto);
  }
}
