/*
  Warnings:

  - The primary key for the `comments` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "comments" DROP CONSTRAINT "comments_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "comments_pkey" PRIMARY KEY ("id");
