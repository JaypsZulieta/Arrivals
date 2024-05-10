-- CreateEnum
CREATE TYPE "GradeLevel" AS ENUM ('G11', 'G12');

-- CreateTable
CREATE TABLE "Track" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "guardId" TEXT NOT NULL,
    "timeAdded" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Track_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Strand" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "trackId" INTEGER NOT NULL,
    "guardId" TEXT NOT NULL,
    "timeAdded" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Strand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Section" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "gradeLevel" "GradeLevel" NOT NULL,
    "strandId" INTEGER NOT NULL,
    "guardId" TEXT NOT NULL,
    "timeAdded" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Section_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Student" (
    "lrn" TEXT NOT NULL,
    "guardianPhonenumber" TEXT NOT NULL,
    "personId" INTEGER NOT NULL,
    "sectionId" INTEGER NOT NULL,
    "guardId" TEXT NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("lrn")
);

-- CreateTable
CREATE TABLE "Arrival" (
    "id" INTEGER NOT NULL,
    "lrn" TEXT NOT NULL,
    "guardId" TEXT NOT NULL,
    "time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Arrival_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Departure" (
    "id" INTEGER NOT NULL,
    "arrivalId" INTEGER NOT NULL,
    "guardId" TEXT NOT NULL,

    CONSTRAINT "Departure_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Track_name_key" ON "Track"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Strand_name_key" ON "Strand"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Section_name_key" ON "Section"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Departure_arrivalId_key" ON "Departure"("arrivalId");

-- AddForeignKey
ALTER TABLE "Track" ADD CONSTRAINT "Track_guardId_fkey" FOREIGN KEY ("guardId") REFERENCES "Guard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Strand" ADD CONSTRAINT "Strand_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Strand" ADD CONSTRAINT "Strand_guardId_fkey" FOREIGN KEY ("guardId") REFERENCES "Guard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_strandId_fkey" FOREIGN KEY ("strandId") REFERENCES "Strand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_guardId_fkey" FOREIGN KEY ("guardId") REFERENCES "Guard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_guardId_fkey" FOREIGN KEY ("guardId") REFERENCES "Guard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Arrival" ADD CONSTRAINT "Arrival_lrn_fkey" FOREIGN KEY ("lrn") REFERENCES "Student"("lrn") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Arrival" ADD CONSTRAINT "Arrival_guardId_fkey" FOREIGN KEY ("guardId") REFERENCES "Guard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Departure" ADD CONSTRAINT "Departure_guardId_fkey" FOREIGN KEY ("guardId") REFERENCES "Guard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Departure" ADD CONSTRAINT "Departure_arrivalId_fkey" FOREIGN KEY ("arrivalId") REFERENCES "Arrival"("id") ON DELETE CASCADE ON UPDATE CASCADE;
