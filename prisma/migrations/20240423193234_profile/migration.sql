/*
  Warnings:

  - You are about to drop the column `journeyId` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the `Ambition` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Journey` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PostTag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProfileAmbition` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProfileTech` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Tech` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PostTag" DROP CONSTRAINT "PostTag_postId_fkey";

-- DropForeignKey
ALTER TABLE "PostTag" DROP CONSTRAINT "PostTag_tagId_fkey";

-- DropForeignKey
ALTER TABLE "Profile" DROP CONSTRAINT "Profile_journeyId_fkey";

-- DropForeignKey
ALTER TABLE "ProfileAmbition" DROP CONSTRAINT "ProfileAmbition_ambitionId_fkey";

-- DropForeignKey
ALTER TABLE "ProfileAmbition" DROP CONSTRAINT "ProfileAmbition_profileId_fkey";

-- DropForeignKey
ALTER TABLE "ProfileTech" DROP CONSTRAINT "ProfileTech_profileId_fkey";

-- DropForeignKey
ALTER TABLE "ProfileTech" DROP CONSTRAINT "ProfileTech_techId_fkey";

-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "journeyId",
ADD COLUMN     "ambitions" TEXT[],
ADD COLUMN     "journey" TEXT,
ADD COLUMN     "tech" TEXT[];

-- DropTable
DROP TABLE "Ambition";

-- DropTable
DROP TABLE "Journey";

-- DropTable
DROP TABLE "PostTag";

-- DropTable
DROP TABLE "ProfileAmbition";

-- DropTable
DROP TABLE "ProfileTech";

-- DropTable
DROP TABLE "Tech";

-- CreateTable
CREATE TABLE "_PostToTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_PostToTag_AB_unique" ON "_PostToTag"("A", "B");

-- CreateIndex
CREATE INDEX "_PostToTag_B_index" ON "_PostToTag"("B");

-- AddForeignKey
ALTER TABLE "_PostToTag" ADD CONSTRAINT "_PostToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PostToTag" ADD CONSTRAINT "_PostToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
