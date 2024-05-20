import { Gender } from '@prisma/client';
import { Exclude, Expose, Type } from 'class-transformer';

export class UserProfileDto {
  @Exclude()
  id: number;

  @Exclude()
  userId: number;
}

export class UserCounts {
  @Expose({ name: 'followedBy' })
  following: number;

  @Expose({ name: 'following' })
  followers: number;
}

export class UserDto {
  @Exclude()
  email: string;

  @Exclude()
  password: string;

  @Exclude()
  refreshToken: string;

  @Type(() => UserProfileDto)
  profile: UserProfileDto;

  @Type(() => UserCounts)
  _count: UserCounts;
}

export class UserProfileShortDto extends UserProfileDto {
  @Exclude()
  gender: Gender;

  @Exclude()
  avatar: string;

  @Exclude()
  city: string;

  @Exclude()
  bio: string;
}

export class UserShortDto extends UserDto {
  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;

  @Type(() => UserProfileShortDto)
  profile: UserProfileShortDto;
}

export class UserFollowerDto {
  @Exclude()
  followingId: number;

  @Exclude()
  followedById: number;

  @Exclude()
  createdAt: number;

  @Type(() => UserShortDto)
  @Expose({ name: 'followedBy' })
  user: UserShortDto;
}

export class UserFollowingDto {
  @Exclude()
  followingId: number;

  @Exclude()
  followedById: number;

  @Exclude()
  createdAt: number;

  @Type(() => UserShortDto)
  @Expose({ name: 'following' })
  user: UserShortDto;
}

export class FollowUnfollowDto {
  followId: number;
}
