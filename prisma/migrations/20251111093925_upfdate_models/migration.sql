-- AlterTable
ALTER TABLE "BaseDocument" ADD COLUMN     "fileUrl" TEXT;

-- AlterTable
ALTER TABLE "JobApplication" ADD COLUMN     "generatedAnschreibenId" TEXT,
ADD COLUMN     "generatedCvVersionId" TEXT,
ADD COLUMN     "parsedJson" JSONB;
