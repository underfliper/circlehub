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
  FollowDto,
  FollowUnfollowDto,
  FollowUnfollowResponse,
  UserDto,
  UserFollowerDto,
  UserFollowingDto,
  UserShortDto,
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

  @Get('suggestedFollows')
  @UsePipes(new ValidationPipe({ transform: true }))
  @HttpCode(HttpStatus.OK)
  suggestedFollows(
    @GetCurrentUser('id') userId: number,
  ): Promise<UserShortDto[]> {
    return this.userService.suggestedFollows(userId);
  }

  @Post('follow')
  follow(
    @GetCurrentUser('id') userId: number,
    @Body() dto: FollowUnfollowDto,
  ): Promise<FollowUnfollowResponse> {
    return this.userService.follow(userId, dto.followId);
  }

  @Post('unfollow')
  unfollow(
    @GetCurrentUser('id') userId: number,
    @Body() dto: FollowUnfollowDto,
  ): Promise<FollowUnfollowResponse> {
    return this.userService.unfollow(userId, dto.followId);
  }

  @Post('edit')
  @UsePipes(new ValidationPipe({ transform: true }))
  @HttpCode(HttpStatus.OK)
  edit(@GetCurrentUser('id') userId: number, @Body() dto: EditUserDto) {
    return this.userService.edit(userId, dto);
  }

  @Get(':id/checkFollow')
  checkFollow(
    @GetCurrentUser('id') issuerId: number,
    @Param('id') userId: string,
  ) {
    return this.userService.checkFollow(issuerId, +userId);
  }

  @Get(':id/followers')
  @UsePipes(new ValidationPipe({ transform: true }))
  @HttpCode(HttpStatus.OK)
  getFollowers(
    @GetCurrentUser('id') issueId: number,
    @Param('id') userId: string,
  ): Promise<FollowDto[]> {
    return this.userService.getUserFollowers(+userId, issueId);
  }

  @Get(':id/following')
  @UsePipes(new ValidationPipe({ transform: true }))
  @HttpCode(HttpStatus.OK)
  getFollowings(
    @GetCurrentUser('id') issueId: number,
    @Param('id') userId: string,
  ): Promise<FollowDto[]> {
    return this.userService.getUserFollowing(+userId, issueId);
  }

  @Get(':id/posts')
  @UsePipes(new ValidationPipe({ transform: true }))
  @HttpCode(HttpStatus.OK)
  getAllPosts(
    @GetCurrentUser('id') issueId: number,
    @Param('id') userId: string,
  ) {
    return this.userService.getAllPosts(+userId, issueId);
  }

  @Get(':id/reposts')
  @UsePipes(new ValidationPipe({ transform: true }))
  @HttpCode(HttpStatus.OK)
  getReposts(
    @GetCurrentUser('id') issueId: number,
    @Param('id') userId: string,
  ) {
    return this.userService.getReposts(+userId, issueId);
  }

  @Get(':id/likes')
  @UsePipes(new ValidationPipe({ transform: true }))
  @HttpCode(HttpStatus.OK)
  getLikedPosts(
    @GetCurrentUser('id') issueId: number,
    @Param('id') userId: string,
  ) {
    return this.userService.getLikedPosts(+userId, issueId);
  }
}
