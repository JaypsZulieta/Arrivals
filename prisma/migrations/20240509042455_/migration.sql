/*
  Warnings:

  - A unique constraint covering the columns `[personId]` on the table `Guard` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Guard_personId_key" ON "Guard"("personId");
