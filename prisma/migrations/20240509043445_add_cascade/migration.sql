-- DropForeignKey
ALTER TABLE "Guard" DROP CONSTRAINT "Guard_personId_fkey";

-- AddForeignKey
ALTER TABLE "Guard" ADD CONSTRAINT "Guard_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;
