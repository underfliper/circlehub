import { Injectable, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { PostDto } from './dto/post.dto';
import { CommentDto } from '../comment/dto';

@Injectable()
export class PostService {
  constructor(
    private prisma: PrismaService,
    private readonly httpService: HttpService,
    private config: ConfigService,
  ) {}

  async getPost(userId: number, postId: number): Promise<PostDto> {
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

    const likes = (
      await this.prisma.like.findMany({
        where: { userId: userId },
      })
    ).map((like) => like.postId);

    const reposts = (
      await this.prisma.repostedPost.findMany({
        where: { userId: userId },
      })
    ).map((repost) => repost.postId);

    const result = {
      ...post,
      controls: {
        isLiked: likes.some((like) => like === post.id),
        isReposted: reposts.some((repost) => repost === post.id),
      },
    };

    return plainToInstance(PostDto, result);
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

  async getSuggestedPosts(userId: number): Promise<Array<PostDto>> {
    const AI_SERVICE_BASE_URL = this.config.get<string>('AI_SERVICE_BASE_URL');

    const { data } = await this.httpService.axiosRef.get<Array<number>>(
      `${AI_SERVICE_BASE_URL}/suggestedposts/${userId}`,
    );

    const posts = await this.prisma.post.findMany({
      where: { id: { in: data } },
      include: {
        author: { include: { profile: true } },
        attachments: true,
        _count: {
          select: { likedBy: true, repostedBy: true, commentedBy: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const likes = (
      await this.prisma.like.findMany({
        where: { userId: userId },
      })
    ).map((like) => like.postId);

    const reposts = (
      await this.prisma.repostedPost.findMany({
        where: { userId: userId },
      })
    ).map((repost) => repost.postId);

    const result = posts.map((post) => {
      const isLiked = likes.some((like) => like === post.id);
      const isReposted = reposts.some((repost) => repost === post.id);

      return {
        ...post,
        controls: { isLiked: isLiked, isReposted: isReposted },
      };
    });

    return plainToInstance(PostDto, result);
  }

  async getFollowingPosts(userId: number): Promise<Array<PostDto>> {
    const users = await this.prisma.follows.findMany({
      where: { followedById: userId },
    });

    const following = users.map((item) => item.followingId);

    const posts = await this.prisma.post.findMany({
      where: { id: { in: following } },
      include: {
        author: { include: { profile: true } },
        attachments: true,
        _count: {
          select: { likedBy: true, repostedBy: true, commentedBy: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const likes = (
      await this.prisma.like.findMany({
        where: { userId: userId },
      })
    ).map((like) => like.postId);

    const reposts = (
      await this.prisma.repostedPost.findMany({
        where: { userId: userId },
      })
    ).map((repost) => repost.postId);

    const result = posts.map((post) => {
      const isLiked = likes.some((like) => like === post.id);
      const isReposted = reposts.some((repost) => repost === post.id);

      return {
        ...post,
        controls: { isLiked: isLiked, isReposted: isReposted },
      };
    });

    return plainToInstance(PostDto, result);
  }

  // TODO: add post
}
