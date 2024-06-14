/*
  Warnings:

  - A unique constraint covering the columns `[name,creatorId]` on the table `Group` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Group_name_creatorId_key" ON "Group"("name", "creatorId");
