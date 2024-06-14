/*
  Warnings:

  - You are about to drop the column `discord` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `github` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `linkedin` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `xProfile` on the `Profile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "discord",
DROP COLUMN "github",
DROP COLUMN "linkedin",
DROP COLUMN "xProfile",
ADD COLUMN     "githubHandle" TEXT,
ADD COLUMN     "githubLink" TEXT,
ADD COLUMN     "instagramHandle" TEXT,
ADD COLUMN     "instagramLink" TEXT,
ADD COLUMN     "linkedinHandle" TEXT,
ADD COLUMN     "linkedinLink" TEXT,
ADD COLUMN     "name" TEXT,
ADD COLUMN     "xProfileHandle" TEXT,
ADD COLUMN     "xProfileLink" TEXT;
