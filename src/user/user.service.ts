import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { plainToInstance } from 'class-transformer';

import { EditUserDto, UserDto, UserFollowerDto, UserFollowingDto } from './dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getWithProfile(userId: number): Promise<UserDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: +userId },
      include: {
        profile: true,
        _count: { select: { followedBy: true, following: true, posts: true } },
      },
    });

    if (user) return plainToInstance(UserDto, user);

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

  async follow(userId: number, followingId: number): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        followedBy: {
          create: { following: { connect: { id: followingId } } },
        },
      },
    });
  }

  async unfollow(userId: number, followingId: number): Promise<void> {
    await this.prisma.follows.delete({
      where: {
        followingId_followedById: {
          followedById: userId,
          followingId: followingId,
        },
      },
    });
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
}