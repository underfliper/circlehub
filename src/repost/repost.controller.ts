import {
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AtGuard } from '../common/guards';
import { RepostService } from './repost.service';
import { GetCurrentUser } from '../common/decorators';

@UseGuards(AtGuard)
@Controller('repost')
export class RepostController {
  constructor(private readonly repostService: RepostService) {}

  @Post('add/:postId')
  @HttpCode(HttpStatus.OK)
  repost(
    @GetCurrentUser('id') userId: number,
    @Param('postId') postId: string,
  ) {
    return this.repostService.addRepost(userId, +postId);
  }

  @Post('remove/:postId')
  @HttpCode(HttpStatus.OK)
  removeRepost(
    @GetCurrentUser('id') userId: number,
    @Param('postId') postId: string,
  ) {
    return this.repostService.removeRepost(userId, +postId);
  }
}
