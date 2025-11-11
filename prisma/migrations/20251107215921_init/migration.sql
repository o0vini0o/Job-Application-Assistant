-- CreateEnum
CREATE TYPE "RemoteType" AS ENUM ('FULL_REMOTE', 'HYBRID', 'ONSITE');

-- CreateEnum
CREATE TYPE "JobApplicationStatus" AS ENUM ('DRAFT', 'SENT', 'RESPONDED', 'INTERVIEWED', 'OFFERED', 'REJECTED', 'ACCEPTED');

-- CreateEnum
CREATE TYPE "ApplicationSource" AS ENUM ('DIRECT', 'LINKEDIN', 'XING', 'STEPSTONE', 'INDEED', 'OTHER');

-- CreateEnum
CREATE TYPE "DocumentVersionType" AS ENUM ('CV', 'ANSCHREIBEN');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('CV', 'ABSCHREIBEN');

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "website" TEXT,
    "linkedinUrl" TEXT,
    "xingUrl" TEXT,
    "kununuUrl" TEXT,
    "address" TEXT,
    "street" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zipCode" TEXT,
    "country" TEXT DEFAULT 'Germany',
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "industry" TEXT,
    "size" INTEGER,
    "headquarters" TEXT,
    "foundedYear" INTEGER,
    "description" TEXT,
    "kununuRating" DOUBLE PRECISION,
    "glassdoorRating" DOUBLE PRECISION,
    "benefits" TEXT[],
    "techStack" TEXT[],

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobApplication" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "jobUrl" TEXT,
    "jobDescription" TEXT,
    "responsibilities" TEXT[],
    "requirements" TEXT[],
    "benefits" TEXT[],
    "languages" TEXT[],
    "location" TEXT,
    "isRemote" BOOLEAN NOT NULL DEFAULT false,
    "remoteType" "RemoteType",
    "startDate" TEXT,
    "salaryRange" TEXT,
    "companyId" TEXT NOT NULL,
    "resumeVersion" TEXT,
    "anschreiben" TEXT,
    "notionPageId" TEXT,
    "notionUrl" TEXT,
    "status" "JobApplicationStatus" NOT NULL DEFAULT 'DRAFT',
    "appliedAt" TIMESTAMP(3),
    "resonseAt" TIMESTAMP(3),
    "interviewDate" TIMESTAMP(3),
    "notes" TEXT,
    "source" "ApplicationSource" NOT NULL DEFAULT 'DIRECT',
    "contacts" JSONB,

    CONSTRAINT "JobApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentVersion" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "jobApplicationId" TEXT NOT NULL,
    "type" "DocumentVersionType" NOT NULL,
    "content" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "fileUrl" TEXT,
    "syncedToNotion" BOOLEAN NOT NULL DEFAULT false,
    "aiModelUsed" TEXT,

    CONSTRAINT "DocumentVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyNote" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "companyId" TEXT NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "tags" TEXT[],

    CONSTRAINT "CompanyNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BaseDocument" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "type" "DocumentType" NOT NULL,
    "name" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "languages" TEXT NOT NULL DEFAULT 'de',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "tags" TEXT[],

    CONSTRAINT "BaseDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "position" TEXT,
    "linkedinUrl" TEXT,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Company_name_key" ON "Company"("name");

-- CreateIndex
CREATE INDEX "Company_name_idx" ON "Company"("name");

-- CreateIndex
CREATE INDEX "Company_city_idx" ON "Company"("city");

-- CreateIndex
CREATE INDEX "Company_industry_idx" ON "Company"("industry");

-- CreateIndex
CREATE INDEX "Company_latitude_longitude_idx" ON "Company"("latitude", "longitude");

-- CreateIndex
CREATE UNIQUE INDEX "JobApplication_notionPageId_key" ON "JobApplication"("notionPageId");

-- CreateIndex
CREATE INDEX "JobApplication_jobTitle_idx" ON "JobApplication"("jobTitle");

-- CreateIndex
CREATE INDEX "JobApplication_status_idx" ON "JobApplication"("status");

-- CreateIndex
CREATE INDEX "JobApplication_createdAt_idx" ON "JobApplication"("createdAt");

-- CreateIndex
CREATE INDEX "DocumentVersion_jobApplicationId_idx" ON "DocumentVersion"("jobApplicationId");

-- CreateIndex
CREATE INDEX "CompanyNote_companyId_idx" ON "CompanyNote"("companyId");

-- CreateIndex
CREATE INDEX "BaseDocument_type_isActive_idx" ON "BaseDocument"("type", "isActive");

-- CreateIndex
CREATE INDEX "Contact_companyId_idx" ON "Contact"("companyId");

-- AddForeignKey
ALTER TABLE "JobApplication" ADD CONSTRAINT "JobApplication_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentVersion" ADD CONSTRAINT "DocumentVersion_jobApplicationId_fkey" FOREIGN KEY ("jobApplicationId") REFERENCES "JobApplication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyNote" ADD CONSTRAINT "CompanyNote_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
