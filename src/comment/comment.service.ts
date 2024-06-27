import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import { PrismaService } from '../prisma/prisma.service';
import { CheckCommentResponse, CommentDto } from './dto';

@Injectable()
export class CommentService {
  constructor(
    private prisma: PrismaService,
    private readonly httpService: HttpService,
    private config: ConfigService,
  ) {}

  async addComment(userId: number, postId: number, text: string) {
    const post = await this.prisma.post.findFirst({ where: { id: postId } });

    if (!post) throw new BadRequestException('There is no post with this ID.');

    const AI_SERVICE_BASE_URL = this.config.get<string>('AI_SERVICE_BASE_URL');

    const { data } = await this.httpService.axiosRef.post<CheckCommentResponse>(
      `${AI_SERVICE_BASE_URL}/checkspam`,
      {
        text,
      },
    );

    if (data.isSpam)
      throw new ForbiddenException(
        'The system has detected the comment as spam, if this is not the case, click "Appeal". Or change your comment.',
      );

    await this.prisma.post.update({
      where: { id: postId },
      data: {
        commentedBy: {
          create: {
            text: text,
            user: {
              connect: {
                id: userId,
              },
            },
          },
        },
      },
    });

    const comment = await this.prisma.comment.findFirst({
      where: {
        userId: userId,
        postId: postId,
      },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
    });

    return plainToInstance(CommentDto, comment);
  }

  // TODO: edit comment

  async removeComment(userId: number, commentId: number) {
    const comment = await this.prisma.comment.findFirst({
      where: { id: commentId },
    });

    if (comment.userId !== userId)
      throw new ForbiddenException(
        'A user with this ID is not the author of a comment with this commentId.',
      );

    await this.prisma.comment.delete({ where: { id: commentId } });

    return true;
  }
}
