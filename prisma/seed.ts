import * as argon from 'argon2';
import usersDB from '../data/users.json';
import profilesDB from '../data/profiles.json';
import postsDB from '../data/posts.json';
import likesDB from '../data/likes.json';
import repostsDB from '../data/reposts.json';
import commentsDB from '../data/comments.json';
import interactionsDB from '../data/interactions.json';

import {
  AttachmentType,
  Gender,
  InteractionType,
  PrismaClient,
} from '@prisma/client';

const prisma = new PrismaClient();

async function hashPassword(password: string) {
  try {
    const hash = await argon.hash(password);
    return hash;
  } catch {
    console.log('Hash error');
  }
}

const getUsers = async () => {
  const users = await Promise.all(
    usersDB.map(async (user) => {
      const { password, ...restUser } = user;
      const { id, userId, gender, ...restProfile } = getUserProfile(user.id);

      return {
        ...restUser,
        password: await hashPassword(password.toString()),
        profile: {
          create: {
            ...restProfile,
            gender: gender === 'Male' ? Gender.MALE : Gender.FEMALE,
          },
        },
      };
    }),
  );

  return users;
};

const getPosts = () =>
  postsDB.map((post) => {
    const { attachments, author, ...rest } = post;

    const likes = getLikes(post.id);
    const reposts = getReposts(post.id);
    const comments = getComments(post.id);
    const interactions = getInteractions(post.id);

    return {
      ...rest,
      attachments: {
        create: post.attachments.map((attachment) => ({
          url: attachment.url,
          type: AttachmentType[attachment.type.toUpperCase()],
        })),
      },
      likedBy: {
        create: likes.map((like) => ({
          user: { connect: { id: like.userId } },
        })),
      },
      repostedBy: {
        create: reposts.map((repost) => ({
          user: { connect: { id: repost.userId } },
        })),
      },
      commentedBy: {
        create: comments.map((comment) => ({
          text: comment.text,
          user: { connect: { id: comment.userId } },
        })),
      },
      interactedBy: {
        create: interactions.map((interaction) => ({
          type: InteractionType[interaction.type.toUpperCase()],
          user: { connect: { id: interaction.userId } },
        })),
      },
      author: { connect: { id: post.author } },
      authorId: post.author,
    };
  });

const getLikes = (postId: number) =>
  likesDB.filter((item) => item.postId === postId);

const getReposts = (postId: number) =>
  repostsDB.filter((item) => item.postId === postId);

const getComments = (postId: number) =>
  commentsDB.filter((item) => item.postId === postId);

const getInteractions = (postId: number) =>
  interactionsDB.filter((item) => item.postId === postId);

const getUserProfile = (id) => profilesDB.find((item) => item.userId === id);

async function main() {
  const users = await getUsers();
  const posts = getPosts();
  await prisma.user.createMany({
    data: users.map((user) => {
      const { id, profile, ...rest } = user;
      return { ...rest };
    }),
  });
  users.forEach(async (user) => {
    await prisma.user.update({
      where: { id: user.id },
      data: { profile: user.profile },
    });
  });

  await prisma.post.createMany({
    data: posts.map((post) => {
      const { content, authorId } = post;
      return { content, authorId };
    }),
  });

  await Promise.all(
    posts.map((post) =>
      prisma.post.update({
        where: { id: post.id },
        data: {
          author: post.author,
          attachments: post.attachments,
          likedBy: post.likedBy,
          repostedBy: post.repostedBy,
          commentedBy: post.commentedBy,
          interactedBy: post.interactedBy,
        },
      }),
    ),
  );
}

main()
  .then(async () => {
    console.log('[SEED] Success.');
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.log('[SEED] Error.');
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
