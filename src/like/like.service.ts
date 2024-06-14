import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LikeService {
  constructor(private prisma: PrismaService) {}

  async addlike(userId: number, postId: number) {
    const isAlreadyLiked = await this.prisma.like.findFirst({
      where: { userId: userId, postId: postId },
    });

    if (isAlreadyLiked) return;

    await this.prisma.post.update({
      where: { id: postId },
      data: {
        likedBy: {
          create: {
            user: {
              connect: {
                id: userId,
              },
            },
          },
        },
      },
    });

    return true;
  }

  async removeLike(userId: number, postId: number) {
    const isAlreadyLiked = await this.prisma.like.findFirst({
      where: { userId: userId, postId: postId },
    });

    if (!isAlreadyLiked)
      throw new BadRequestException(
        'There are no likes for a post with this ID and this user ID.',
      );

    await this.prisma.like.delete({
      where: {
        userId_postId: {
          userId: userId,
          postId: postId,
        },
      },
    });

    return false;
  }
}
