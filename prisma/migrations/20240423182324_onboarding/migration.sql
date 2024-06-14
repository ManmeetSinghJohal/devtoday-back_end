/*
  Warnings:

  - You are about to drop the column `title` on the `Ambition` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Journey` table. All the data in the column will be lost.
  - Added the required column `name` to the `Ambition` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Journey` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Ambition" DROP COLUMN "title",
ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Journey" DROP COLUMN "title",
ADD COLUMN     "name" TEXT NOT NULL;
