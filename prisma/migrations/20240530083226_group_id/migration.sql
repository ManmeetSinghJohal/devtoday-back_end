/*
  Warnings:

  - The primary key for the `GroupUser` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `GroupUser` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "GroupUser" DROP CONSTRAINT "GroupUser_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "GroupUser_pkey" PRIMARY KEY ("userId", "groupId");
