import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { plainToInstance } from 'class-transformer';

import {
  EditUserDto,
  FollowUnfollowResponse,
  UserDto,
  UserFollowerDto,
  UserFollowingDto,
  UserShortDto,
} from './dto';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { PostDto } from '../post/dto';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private readonly httpService: HttpService,
    private config: ConfigService,
  ) {}

  async getWithProfile(userId: number): Promise<UserDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: +userId },
      include: {
        profile: true,
        _count: { select: { followedBy: true, following: true, posts: true } },
      },
    });

    if (user) {
      const reposts = await this.prisma.repostedPost.count({
        where: { userId: userId },
      });

      user._count.posts += reposts;

      return plainToInstance(UserDto, user);
    }

    throw new NotFoundException('User not found.');
  }

  async getUserFollowers(userId: number): Promise<UserFollowerDto[]> {
    const users = await this.prisma.follows.findMany({
      where: { followingId: userId },
      include: { followedBy: { include: { profile: true } } },
    });

    return plainToInstance(UserFollowerDto, users);
  }

  async getUserFollowing(userId: number): Promise<UserFollowingDto[]> {
    const users = await this.prisma.follows.findMany({
      where: { followedById: userId },
      include: { following: { include: { profile: true } } },
    });

    return plainToInstance(UserFollowingDto, users);
  }

  async getAllPosts(userId: number, isssueId: number) {
    const posts = await this.prisma.post.findMany({
      where: { author: { id: userId } },
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

    const reposts = await this.prisma.repostedPost.findMany({
      where: { userId: userId },
      include: {
        post: {
          include: {
            author: { include: { profile: true } },
            attachments: true,
            _count: {
              select: { likedBy: true, repostedBy: true, commentedBy: true },
            },
          },
        },
      },
    });

    const processedReposts = reposts.map((repost) => {
      const { post, createdAt } = repost;

      return { ...post, createdAt: createdAt };
    });

    const allPosts = [...posts, ...processedReposts].sort((a, b) =>
      a.createdAt < b.createdAt ? 1 : b.createdAt < a.createdAt ? -1 : 0,
    );

    const likes = (
      await this.prisma.like.findMany({
        where: { userId: isssueId },
      })
    ).map((like) => like.postId);

    const repostedBy = (
      await this.prisma.repostedPost.findMany({
        where: { userId: isssueId },
      })
    ).map((repost) => repost.postId);

    const result = allPosts.map((post) => {
      const isLiked = likes.some((like) => like === post.id);
      const isReposted = repostedBy.some((repost) => repost === post.id);

      return {
        ...post,
        controls: { isLiked: isLiked, isReposted: isReposted },
      };
    });

    return plainToInstance(PostDto, result);
  }

  async getReposts(userId: number, isssueId: number) {
    const repostedPosts = await this.prisma.repostedPost.findMany({
      where: { userId: userId },
      include: {
        post: {
          include: {
            author: { include: { profile: true } },
            attachments: true,
            _count: {
              select: { likedBy: true, repostedBy: true, commentedBy: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const processedReposts = repostedPosts.map((repost) => {
      const { post, createdAt } = repost;

      return { ...post, createdAt: createdAt };
    });

    const likes = (
      await this.prisma.like.findMany({
        where: { userId: isssueId },
      })
    ).map((like) => like.postId);

    const repostedBy = (
      await this.prisma.repostedPost.findMany({
        where: { userId: isssueId },
      })
    ).map((repost) => repost.postId);

    const result = processedReposts.map((post) => {
      const isLiked = likes.some((like) => like === post.id);
      const isReposted = repostedBy.some((repost) => repost === post.id);

      return {
        ...post,
        controls: { isLiked: isLiked, isReposted: isReposted },
      };
    });

    return plainToInstance(PostDto, result);
  }

  async getLikedPosts(userId: number, isssueId: number) {
    const likedPosts = await this.prisma.like.findMany({
      where: { userId: userId },
      include: {
        post: {
          include: {
            author: { include: { profile: true } },
            attachments: true,
            _count: {
              select: { likedBy: true, repostedBy: true, commentedBy: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const processedLikes = likedPosts.map((like) => {
      const { post, createdAt } = like;

      return { ...post, createdAt: createdAt };
    });

    const likes = (
      await this.prisma.like.findMany({
        where: { userId: isssueId },
      })
    ).map((like) => like.postId);

    const repostedBy = (
      await this.prisma.repostedPost.findMany({
        where: { userId: isssueId },
      })
    ).map((repost) => repost.postId);

    const result = processedLikes.map((post) => {
      const isLiked = likes.some((like) => like === post.id);
      const isReposted = repostedBy.some((repost) => repost === post.id);

      return {
        ...post,
        controls: { isLiked: isLiked, isReposted: isReposted },
      };
    });

    return plainToInstance(PostDto, result);
  }

  async follow(
    userId: number,
    followingId: number,
  ): Promise<FollowUnfollowResponse> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        followedBy: {
          create: { following: { connect: { id: followingId } } },
        },
      },
    });

    return { followStatus: true };
  }

  async unfollow(
    userId: number,
    followingId: number,
  ): Promise<FollowUnfollowResponse> {
    await this.prisma.follows.delete({
      where: {
        followingId_followedById: {
          followedById: userId,
          followingId: followingId,
        },
      },
    });

    return { followStatus: false };
  }

  async edit(userId: number, dto: EditUserDto) {
    if (dto.username) {
      const usernameExist = await this.prisma.user.findFirst({
        where: { id: userId, username: dto.username },
      });

      if (usernameExist)
        throw new BadRequestException('Username already exist.');

      await this.prisma.user.update({
        where: { id: userId },
        data: { username: dto.username },
      });
    }

    await this.prisma.profile.update({
      where: { userId: userId },
      data: { ...dto.profile },
    });

    const updatedUser = await this.prisma.user.findFirst({
      where: { id: userId },
      include: { profile: true },
    });

    return plainToInstance(UserDto, updatedUser);
  }

  async suggestedFollows(userId: number) {
    const AI_SERVICE_BASE_URL = this.config.get<string>('AI_SERVICE_BASE_URL');

    const { data } = await this.httpService.axiosRef.get<number[]>(
      `${AI_SERVICE_BASE_URL}/suggestedfollows/${userId}`,
    );

    const suggested = await this.prisma.user.findMany({
      where: { id: { in: data } },
      include: { profile: true },
    });

    return plainToInstance(UserShortDto, suggested);
  }
}
