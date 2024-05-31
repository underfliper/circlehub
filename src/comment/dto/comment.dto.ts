import { Exclude, Type } from 'class-transformer';
import { IsString, MaxLength, MinLength } from 'class-validator';
import { UserShortDto } from '../../user/dto';

export class CommentDto {
  @Exclude()
  userId: number;

  @Exclude()
  postId: number;

  @Type(() => UserShortDto)
  user: UserShortDto;
}

export class NewCommentDto {
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  text: string;
}

export class CheckCommentResponse {
  isSpam: boolean;
  text: string;
}
