import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RepostService {
  constructor(private prisma: PrismaService) {}

  async addRepost(userId: number, postId: number) {
    const isAlreadyReposted = await this.prisma.repostedPost.findFirst({
      where: { userId: userId, postId: postId },
    });

    if (isAlreadyReposted) return;

    await this.prisma.post.update({
      where: { id: postId },
      data: {
        repostedBy: {
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

  async removeRepost(userId: number, postId: number) {
    const isAlreadyReposted = await this.prisma.repostedPost.findFirst({
      where: { userId: userId, postId: postId },
    });

    if (!isAlreadyReposted)
      throw new BadRequestException(
        'There are no reposts for a post with this ID and this user ID.',
      );

    await this.prisma.repostedPost.delete({
      where: {
        userId_postId: {
          userId: userId,
          postId: postId,
        },
      },
    });

    return true;
  }
}
