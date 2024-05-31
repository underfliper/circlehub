import { Injectable, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { PrismaService } from '../prisma/prisma.service';
import { PostDto } from './dto/post.dto';
import { CommentDto } from '../comment/dto';

@Injectable()
export class PostService {
  constructor(private prisma: PrismaService) {}

  async getPost(postId: number): Promise<PostDto> {
    const post = await this.prisma.post.findFirst({
      where: { id: postId },
      include: {
        author: { include: { profile: true } },
        attachments: true,
        _count: {
          select: { likedBy: true, repostedBy: true, commentedBy: true },
        },
      },
    });

    if (!post) throw new NotFoundException('There is no post with this ID.');

    return plainToInstance(PostDto, post);
  }

  async getPostComments(postId: number): Promise<CommentDto[]> {
    const post = await this.prisma.post.findFirst({ where: { id: postId } });

    if (!post) throw new NotFoundException('There is no post with this ID.');

    const comments = await this.prisma.comment.findMany({
      where: { postId: postId },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
    });

    return plainToInstance(CommentDto, comments);
  }

  // TODO: add post
}
