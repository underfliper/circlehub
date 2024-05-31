import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { AtGuard } from '../common/guards';
import { GetCurrentUser } from '../common/decorators';
import { NewCommentDto } from './dto';

@UseGuards(AtGuard)
@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post('add/:postId')
  @HttpCode(HttpStatus.CREATED)
  addComment(
    @GetCurrentUser('id') userId: number,
    @Param('postId') postId: string,
    @Body() dto: NewCommentDto,
  ) {
    return this.commentService.addComment(userId, +postId, dto.text);
  }

  @Post('remove/:commentId')
  @HttpCode(HttpStatus.OK)
  removeComment(
    @GetCurrentUser('id') userId: number,
    @Param('commentId') commentId: string,
  ) {
    return this.commentService.removeComment(userId, +commentId);
  }
}
