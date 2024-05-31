import { Exclude, Expose, Type } from 'class-transformer';
import { UserShortDto } from 'src/user/dto';

export class PostStats {
  @Expose({ name: 'likedBy' })
  likes: number;

  @Expose({ name: 'repostedBy' })
  reposts: number;

  @Expose({ name: 'commentedBy' })
  comments: number;
}

export class PostDto {
  @Exclude()
  authorId: number;

  @Type(() => UserShortDto)
  author: UserShortDto;

  @Type(() => AttachmentDto)
  attachments: AttachmentDto[];

  @Type(() => PostStats)
  _count: PostStats;
}

export class AttachmentDto {
  @Exclude()
  postId: number;

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;
}
