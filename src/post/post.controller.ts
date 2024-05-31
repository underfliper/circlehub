import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  UseGuards,
} from '@nestjs/common';
import { PostService } from './post.service';
import { AtGuard } from '../common/guards';
import { PostDto } from './dto';
import { CommentDto } from '../comment/dto';

@UseGuards(AtGuard)
@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  getPost(@Param('id') postId: string): Promise<PostDto> {
    return this.postService.getPost(+postId);
  }

  @Get(':id/comments')
  @HttpCode(HttpStatus.OK)
  getPostComments(@Param('id') postId: string): Promise<CommentDto[]> {
    return this.postService.getPostComments(+postId);
  }
}
