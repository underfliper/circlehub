import { Tokens } from './tokens.type';

export type AuthUser = {
  user: {
    id: number;
    email: string;
    username: string;
    name: string;
    image: string;
  };
  tokens: Tokens;
};
