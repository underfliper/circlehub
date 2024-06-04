import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon from 'argon2';

import { AuthDto, RegisterDto } from './dto';
import { JwtPayload, Tokens } from './types';
import { AuthUser } from './types/auth.type';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async signup(dto: RegisterDto): Promise<Tokens> {
    const isUsernameExist = await this.prisma.user.findFirst({
      where: { username: dto.username },
    });

    if (isUsernameExist)
      throw new BadRequestException({
        target: 'username',
        message: 'This username already exists.',
        statusCode: 400,
      });

    const isEmailExist = await this.prisma.user.findFirst({
      where: { email: dto.email },
    });

    if (isEmailExist)
      throw new BadRequestException({
        target: 'email',
        message: 'This email already exists.',
        statusCode: 400,
      });

    const hashedPassword = await argon.hash(dto.password);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        username: dto.username,
        password: hashedPassword,
        profile: {
          create: {
            firstName: dto.firstName,
            lastName: dto.lastName,
          },
        },
      },
    });

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRtHash(user.id, tokens.refreshToken);

    return tokens;
  }

  async signin(dto: AuthDto): Promise<AuthUser> {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
      include: { profile: true },
    });

    if (!user) throw new UnauthorizedException('Wrong email or password.');

    const passwordMatches = await argon.verify(user.password, dto.password);

    if (!passwordMatches)
      throw new UnauthorizedException('Wrong email or password.');

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRtHash(user.id, tokens.refreshToken);

    const authUser = {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: `${user.profile.firstName} ${user.profile.lastName}`,
        image: user.profile.avatar,
      },
      tokens,
    };

    return authUser;
  }

  async signout(userId: number): Promise<boolean> {
    await this.prisma.user.updateMany({
      where: {
        id: userId,
        refreshToken: {
          not: null,
        },
      },
      data: {
        refreshToken: null,
      },
    });
    return true;
  }

  async getTokens(userId: number, email: string): Promise<Tokens> {
    const jwtPayload: JwtPayload = {
      id: userId,
      email: email,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: this.config.get<string>('AT_SECRET'),
        expiresIn: this.config.get<string>('AT_EXPIRES'),
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: this.config.get<string>('RT_SECRET'),
        expiresIn: this.config.get<string>('RT_EXPIRES'),
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshTokens(userId: number, refreshToken: string): Promise<Tokens> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user || !user.refreshToken)
      throw new UnauthorizedException('Access denied.');

    const rtMatches = await argon.verify(user.refreshToken, refreshToken);
    if (!rtMatches) throw new UnauthorizedException('Refresh token malformed.');

    const tokens = await this.getTokens(user.id, user.email);

    await this.updateRtHash(user.id, tokens.refreshToken);

    return tokens;
  }

  async updateRtHash(userId: number, rt: string): Promise<void> {
    const hashedRefreshToken = await argon.hash(rt);

    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        refreshToken: hashedRefreshToken,
      },
    });
  }
}
