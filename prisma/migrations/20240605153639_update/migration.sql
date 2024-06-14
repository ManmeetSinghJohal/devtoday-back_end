/*
  Warnings:

  - You are about to drop the column `audio` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `content` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `meetDate` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Post` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Post" DROP COLUMN "audio",
DROP COLUMN "content",
DROP COLUMN "image",
DROP COLUMN "location",
DROP COLUMN "meetDate",
DROP COLUMN "type",
ADD COLUMN     "audioFile" TEXT,
ADD COLUMN     "audioTitle" TEXT,
ADD COLUMN     "coverImage" TEXT,
ADD COLUMN     "createType" "PostType" NOT NULL DEFAULT 'STANDARD',
ADD COLUMN     "meetupDate" TIMESTAMP(3),
ADD COLUMN     "meetupLocation" TEXT,
ADD COLUMN     "tinyContent" TEXT;
