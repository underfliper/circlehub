import {
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { LikeService } from './like.service';
import { AtGuard } from '../common/guards';
import { GetCurrentUser } from '../common/decorators';

@UseGuards(AtGuard)
@Controller('like')
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @Post('add/:postId')
  @HttpCode(HttpStatus.OK)
  addLike(
    @GetCurrentUser('id') userId: number,
    @Param('postId') postId: string,
  ) {
    return this.likeService.addlike(userId, +postId);
  }

  @Post('remove/:postId')
  @HttpCode(HttpStatus.OK)
  removeLike(
    @GetCurrentUser('id') userId: number,
    @Param('postId') postId: string,
  ) {
    return this.likeService.removeLike(userId, +postId);
  }
}
