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
import { GetCurrentUser } from '../common/decorators';

@UseGuards(AtGuard)
@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get('/suggested')
  @HttpCode(HttpStatus.OK)
  getSuggestedPosts(
    @GetCurrentUser('id') userId: number,
  ): Promise<Array<PostDto>> {
    console.log();
    return this.postService.getSuggestedPosts(userId);
  }

  @Get('/following')
  @HttpCode(HttpStatus.OK)
  getFollowingPosts(
    @GetCurrentUser('id') userId: number,
  ): Promise<Array<PostDto>> {
    console.log();
    return this.postService.getFollowingPosts(userId);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  getPost(
    @GetCurrentUser('id') userId: number,
    @Param('id') postId: string,
  ): Promise<PostDto> {
    return this.postService.getPost(userId, +postId);
  }

  @Get(':id/comments')
  @HttpCode(HttpStatus.OK)
  getPostComments(@Param('id') postId: string): Promise<CommentDto[]> {
    return this.postService.getPostComments(+postId);
  }
}
