/*
  Warnings:

  - You are about to drop the column `benefits` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `techStack` on the `Company` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Company" DROP COLUMN "benefits",
DROP COLUMN "techStack";
