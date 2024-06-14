/*
  Warnings:

  - You are about to drop the column `active` on the `Group` table. All the data in the column will be lost.
  - You are about to drop the column `active` on the `GroupUser` table. All the data in the column will be lost.
  - You are about to drop the column `isCreator` on the `GroupUser` table. All the data in the column will be lost.
  - Added the required column `creatorId` to the `Group` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Group" DROP COLUMN "active",
ADD COLUMN     "creatorId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "GroupUser" DROP COLUMN "active",
DROP COLUMN "isCreator";
