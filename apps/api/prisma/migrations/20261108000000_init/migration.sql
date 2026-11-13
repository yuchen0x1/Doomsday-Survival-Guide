-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('draft', 'pending_review', 'reviewed', 'published', 'retired');

-- CreateEnum
CREATE TYPE "DangerLevel" AS ENUM ('L0', 'L1', 'L2', 'L3', 'L4');

-- CreateEnum
CREATE TYPE "Credibility" AS ENUM ('A', 'B', 'C', 'D');

-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('government', 'medical', 'academic', 'ngo', 'manual', 'community', 'ai_generated');

-- CreateEnum
CREATE TYPE "QuizType" AS ENUM ('plant', 'animal', 'first_aid', 'skill');

-- CreateEnum
CREATE TYPE "BookmarkKind" AS ENUM ('article', 'plant', 'animal', 'insect', 'medicine', 'first_aid', 'skill', 'supply', 'scenario', 'hazard');

-- CreateEnum
CREATE TYPE "MapMarkerKind" AS ENUM ('water', 'shelter', 'danger', 'route', 'supply', 'custom');

-- CreateEnum
CREATE TYPE "OfflineStatus" AS ENUM ('not_downloaded', 'downloading', 'downloaded', 'update_available');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "refreshTokenHash" TEXT NOT NULL,
    "userAgent" TEXT,
    "ip" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Source" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT,
    "publisher" TEXT,
    "publishedAt" TIMESTAMP(3),
    "verifiedAt" TIMESTAMP(3),
    "verifiedBy" TEXT,
    "type" "SourceType" NOT NULL,
    "credibility" "Credibility" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Source_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Article" (
    "id" TEXT NOT NULL,
    "categorySlug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "aliases" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "summary" TEXT NOT NULL,
    "coverImage" TEXT,
    "environment" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "scenarios" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "sections" JSONB NOT NULL,
    "steps" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tools" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "precautions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "contraindications" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "difficulty" INTEGER NOT NULL DEFAULT 1,
    "relatedIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "offlineReady" BOOLEAN NOT NULL DEFAULT false,
    "dangerLevel" "DangerLevel" NOT NULL DEFAULT 'L0',
    "reviewStatus" "ReviewStatus" NOT NULL DEFAULT 'draft',
    "reviewNote" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "aiGenerated" BOOLEAN NOT NULL DEFAULT false,
    "version" INTEGER NOT NULL DEFAULT 1,
    "sourceIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plant" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "scientificName" TEXT NOT NULL,
    "aliases" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "family" TEXT NOT NULL,
    "image" TEXT,
    "leaf" TEXT NOT NULL,
    "flower" TEXT NOT NULL,
    "fruit" TEXT NOT NULL,
    "stem" TEXT NOT NULL,
    "root" TEXT NOT NULL,
    "season" TEXT NOT NULL,
    "distribution" TEXT NOT NULL,
    "habitat" TEXT NOT NULL,
    "usableParts" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "uses" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "toxicity" TEXT NOT NULL,
    "lookalikes" JSONB NOT NULL DEFAULT '[]',
    "confusionRisk" TEXT NOT NULL,
    "edibilityWarning" TEXT NOT NULL,
    "confidence" "Credibility" NOT NULL DEFAULT 'C',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "dangerLevel" "DangerLevel" NOT NULL DEFAULT 'L0',
    "reviewStatus" "ReviewStatus" NOT NULL DEFAULT 'draft',
    "reviewNote" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "aiGenerated" BOOLEAN NOT NULL DEFAULT false,
    "version" INTEGER NOT NULL DEFAULT 1,
    "sourceIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Plant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Animal" (
    "id" TEXT NOT NULL,
    "animalClass" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "scientificName" TEXT NOT NULL,
    "aliases" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "image" TEXT,
    "appearance" TEXT NOT NULL,
    "habitat" TEXT NOT NULL,
    "activityTime" TEXT NOT NULL,
    "behavior" TEXT NOT NULL,
    "diet" TEXT NOT NULL,
    "tracks" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "feces" TEXT NOT NULL,
    "dangerLevel" "DangerLevel" NOT NULL DEFAULT 'L0',
    "possibleInjury" TEXT NOT NULL,
    "safetyMeasures" TEXT NOT NULL,
    "biteFirstAid" TEXT NOT NULL,
    "distribution" TEXT NOT NULL,
    "identificationConfidence" "Credibility" NOT NULL DEFAULT 'C',
    "identificationNote" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "reviewStatus" "ReviewStatus" NOT NULL DEFAULT 'draft',
    "reviewNote" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "aiGenerated" BOOLEAN NOT NULL DEFAULT false,
    "version" INTEGER NOT NULL DEFAULT 1,
    "sourceIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Animal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnimalTrack" (
    "id" TEXT NOT NULL,
    "animalId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "gait" TEXT,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnimalTrack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Insect" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "scientificName" TEXT NOT NULL,
    "aliases" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "image" TEXT,
    "appearance" TEXT NOT NULL,
    "habitat" TEXT NOT NULL,
    "season" TEXT NOT NULL,
    "behavior" TEXT NOT NULL,
    "dangerLevel" "DangerLevel" NOT NULL DEFAULT 'L0',
    "stingBiteRisk" TEXT NOT NULL,
    "firstAid" TEXT NOT NULL,
    "uses" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "distribution" TEXT NOT NULL,
    "confidence" "Credibility" NOT NULL DEFAULT 'C',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "reviewStatus" "ReviewStatus" NOT NULL DEFAULT 'draft',
    "reviewNote" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "aiGenerated" BOOLEAN NOT NULL DEFAULT false,
    "version" INTEGER NOT NULL DEFAULT 1,
    "sourceIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Insect_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Medicine" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "aliases" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "category" TEXT NOT NULL,
    "image" TEXT,
    "purpose" TEXT NOT NULL,
    "commonForms" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "keyPoints" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "risks" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "contraindications" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "storage" TEXT NOT NULL,
    "disclaimer" TEXT NOT NULL,
    "dangerLevel" "DangerLevel" NOT NULL DEFAULT 'L0',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "reviewStatus" "ReviewStatus" NOT NULL DEFAULT 'draft',
    "reviewNote" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "aiGenerated" BOOLEAN NOT NULL DEFAULT false,
    "version" INTEGER NOT NULL DEFAULT 1,
    "sourceIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Medicine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FirstAidGuide" (
    "id" TEXT NOT NULL,
    "categorySlug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "image" TEXT,
    "applicable" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "dangerSignals" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "immediateSafety" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "wrongActions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "steps" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "whenToSeekHelp" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "difficulty" INTEGER NOT NULL DEFAULT 1,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "relatedIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "offlineReady" BOOLEAN NOT NULL DEFAULT false,
    "dangerLevel" "DangerLevel" NOT NULL DEFAULT 'L0',
    "reviewStatus" "ReviewStatus" NOT NULL DEFAULT 'draft',
    "reviewNote" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "aiGenerated" BOOLEAN NOT NULL DEFAULT false,
    "version" INTEGER NOT NULL DEFAULT 1,
    "sourceIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FirstAidGuide_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Skill" (
    "id" TEXT NOT NULL,
    "categorySlug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "coverImage" TEXT,
    "purpose" TEXT NOT NULL,
    "scenarios" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "materials" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tools" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "difficulty" INTEGER NOT NULL DEFAULT 1,
    "estimatedMinutes" INTEGER NOT NULL DEFAULT 0,
    "steps" JSONB NOT NULL DEFAULT '[]',
    "cautions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "failureReasons" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "safetyChecklist" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "alternatives" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "relatedIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "verification" TEXT NOT NULL DEFAULT 'pending_review',
    "dangerLevel" "DangerLevel" NOT NULL DEFAULT 'L0',
    "offlineReady" BOOLEAN NOT NULL DEFAULT false,
    "reviewStatus" "ReviewStatus" NOT NULL DEFAULT 'draft',
    "reviewNote" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "aiGenerated" BOOLEAN NOT NULL DEFAULT false,
    "version" INTEGER NOT NULL DEFAULT 1,
    "sourceIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Supply" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT,
    "purpose" TEXT NOT NULL,
    "usage" TEXT NOT NULL,
    "storageMethod" TEXT NOT NULL,
    "shelfLife" TEXT NOT NULL,
    "scenarios" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "risks" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "substitutes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "relatedTutorialIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "unit" TEXT NOT NULL DEFAULT '个',
    "defaultPriority" INTEGER NOT NULL DEFAULT 2,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "dangerLevel" "DangerLevel" NOT NULL DEFAULT 'L0',
    "reviewStatus" "ReviewStatus" NOT NULL DEFAULT 'draft',
    "reviewNote" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "aiGenerated" BOOLEAN NOT NULL DEFAULT false,
    "version" INTEGER NOT NULL DEFAULT 1,
    "sourceIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Supply_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Scenario" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "image" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "difficulty" INTEGER NOT NULL DEFAULT 1,
    "isSimulation" BOOLEAN NOT NULL DEFAULT true,
    "debrief" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "relatedArticleIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "dangerLevel" "DangerLevel" NOT NULL DEFAULT 'L0',
    "reviewStatus" "ReviewStatus" NOT NULL DEFAULT 'draft',
    "reviewNote" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "aiGenerated" BOOLEAN NOT NULL DEFAULT false,
    "version" INTEGER NOT NULL DEFAULT 1,
    "sourceIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Scenario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScenarioStep" (
    "id" TEXT NOT NULL,
    "scenarioId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "scene" TEXT NOT NULL,
    "environment" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "knownHazards" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "availableResources" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "partyStatus" TEXT NOT NULL,
    "timeLimit" TEXT,
    "objective" TEXT NOT NULL,
    "recommended" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "discouraged" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "dangerLevel" "DangerLevel" NOT NULL DEFAULT 'L0',
    "reviewStatus" "ReviewStatus" NOT NULL DEFAULT 'published',
    "reviewNote" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "aiGenerated" BOOLEAN NOT NULL DEFAULT false,
    "version" INTEGER NOT NULL DEFAULT 1,
    "sourceIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScenarioStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScenarioChoice" (
    "id" TEXT NOT NULL,
    "stepId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "label" TEXT NOT NULL,
    "consequence" TEXT NOT NULL,
    "nextStepId" TEXT,
    "riskLevel" "DangerLevel" NOT NULL DEFAULT 'L1',
    "quality" TEXT NOT NULL DEFAULT 'acceptable',
    "dangerLevel" "DangerLevel" NOT NULL DEFAULT 'L1',
    "reviewStatus" "ReviewStatus" NOT NULL DEFAULT 'published',
    "reviewNote" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "aiGenerated" BOOLEAN NOT NULL DEFAULT false,
    "version" INTEGER NOT NULL DEFAULT 1,
    "sourceIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScenarioChoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hazard" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "dangerLevel" "DangerLevel" NOT NULL DEFAULT 'L0',
    "description" TEXT NOT NULL,
    "indicators" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "prevention" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "emergencyResponse" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "region" TEXT,
    "reviewStatus" "ReviewStatus" NOT NULL DEFAULT 'draft',
    "reviewNote" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "aiGenerated" BOOLEAN NOT NULL DEFAULT false,
    "version" INTEGER NOT NULL DEFAULT 1,
    "sourceIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Hazard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizQuestion" (
    "id" TEXT NOT NULL,
    "type" "QuizType" NOT NULL,
    "question" TEXT NOT NULL,
    "options" TEXT[],
    "answerIndex" INTEGER NOT NULL,
    "explanation" TEXT NOT NULL,
    "sourceRefId" TEXT NOT NULL,
    "sourceTitle" TEXT NOT NULL,
    "difficulty" INTEGER NOT NULL DEFAULT 1,
    "dangerLevel" "DangerLevel" NOT NULL DEFAULT 'L0',
    "reviewStatus" "ReviewStatus" NOT NULL DEFAULT 'draft',
    "reviewNote" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "aiGenerated" BOOLEAN NOT NULL DEFAULT false,
    "version" INTEGER NOT NULL DEFAULT 1,
    "sourceIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuizQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewRecord" (
    "id" TEXT NOT NULL,
    "contentKind" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "fromStatus" TEXT,
    "toStatus" TEXT NOT NULL,
    "decision" TEXT NOT NULL,
    "note" TEXT,
    "reviewerId" TEXT NOT NULL,
    "reviewerEmail" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReviewRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentTag" (
    "id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "tag" TEXT NOT NULL,

    CONSTRAINT "ContentTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bookmark" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" "BookmarkKind" NOT NULL,
    "refId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "note" TEXT,
    "collection" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bookmark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReadingHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "refId" TEXT NOT NULL,
    "kind" "BookmarkKind" NOT NULL,
    "title" TEXT NOT NULL,
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReadingHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserNote" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL DEFAULT '',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "supplyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "unit" TEXT NOT NULL DEFAULT '个',
    "minQuantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "priority" INTEGER NOT NULL DEFAULT 2,
    "expiresAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InventoryEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryTransaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "delta" DOUBLE PRECISION NOT NULL,
    "reason" TEXT NOT NULL DEFAULT '',
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InventoryTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SurvivalProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL DEFAULT '',
    "householdSize" INTEGER NOT NULL DEFAULT 1,
    "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "shelterPlan" TEXT NOT NULL DEFAULT '',
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SurvivalProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "chosenIndex" INTEGER NOT NULL,
    "correct" BOOLEAN NOT NULL,
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuizRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIConversation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT '新对话',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIConversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIMessage" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "toolCalls" JSONB,
    "toolResults" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MapMarker" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" "MapMarkerKind" NOT NULL DEFAULT 'custom',
    "name" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "note" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "private" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MapMarker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MapRoute" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "points" JSONB NOT NULL DEFAULT '[]',
    "distanceMeters" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MapRoute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OfflinePackage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "categorySlugs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "sizeBytes" INTEGER NOT NULL DEFAULT 0,
    "version" TEXT NOT NULL DEFAULT '1.0.0',
    "status" "OfflineStatus" NOT NULL DEFAULT 'not_downloaded',
    "progress" INTEGER,
    "downloadedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OfflinePackage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "status" INTEGER,
    "ip" TEXT,
    "userAgent" TEXT,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemSetting" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemSetting_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "EmergencyContact" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "relation" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmergencyContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIUsageLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "endpoint" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ok',
    "promptTokens" INTEGER,
    "completionTokens" INTEGER,
    "totalTokens" INTEGER,
    "latencyMs" INTEGER,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIUsageLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "UserSession_userId_idx" ON "UserSession"("userId");

-- CreateIndex
CREATE INDEX "UserSession_expiresAt_idx" ON "UserSession"("expiresAt");

-- CreateIndex
CREATE INDEX "Source_type_credibility_idx" ON "Source"("type", "credibility");

-- CreateIndex
CREATE INDEX "Article_reviewStatus_dangerLevel_idx" ON "Article"("reviewStatus", "dangerLevel");

-- CreateIndex
CREATE INDEX "Article_categorySlug_idx" ON "Article"("categorySlug");

-- CreateIndex
CREATE INDEX "Plant_reviewStatus_dangerLevel_idx" ON "Plant"("reviewStatus", "dangerLevel");

-- CreateIndex
CREATE INDEX "Plant_category_idx" ON "Plant"("category");

-- CreateIndex
CREATE INDEX "Animal_reviewStatus_dangerLevel_idx" ON "Animal"("reviewStatus", "dangerLevel");

-- CreateIndex
CREATE INDEX "Animal_animalClass_idx" ON "Animal"("animalClass");

-- CreateIndex
CREATE INDEX "AnimalTrack_animalId_idx" ON "AnimalTrack"("animalId");

-- CreateIndex
CREATE INDEX "Insect_reviewStatus_dangerLevel_idx" ON "Insect"("reviewStatus", "dangerLevel");

-- CreateIndex
CREATE INDEX "Medicine_reviewStatus_dangerLevel_idx" ON "Medicine"("reviewStatus", "dangerLevel");

-- CreateIndex
CREATE INDEX "FirstAidGuide_reviewStatus_dangerLevel_idx" ON "FirstAidGuide"("reviewStatus", "dangerLevel");

-- CreateIndex
CREATE INDEX "FirstAidGuide_categorySlug_idx" ON "FirstAidGuide"("categorySlug");

-- CreateIndex
CREATE INDEX "Skill_reviewStatus_dangerLevel_idx" ON "Skill"("reviewStatus", "dangerLevel");

-- CreateIndex
CREATE INDEX "Skill_categorySlug_idx" ON "Skill"("categorySlug");

-- CreateIndex
CREATE INDEX "Supply_reviewStatus_dangerLevel_idx" ON "Supply"("reviewStatus", "dangerLevel");

-- CreateIndex
CREATE INDEX "Supply_category_idx" ON "Supply"("category");

-- CreateIndex
CREATE UNIQUE INDEX "Scenario_slug_key" ON "Scenario"("slug");

-- CreateIndex
CREATE INDEX "Scenario_reviewStatus_dangerLevel_idx" ON "Scenario"("reviewStatus", "dangerLevel");

-- CreateIndex
CREATE INDEX "ScenarioStep_scenarioId_order_idx" ON "ScenarioStep"("scenarioId", "order");

-- CreateIndex
CREATE INDEX "ScenarioChoice_stepId_order_idx" ON "ScenarioChoice"("stepId", "order");

-- CreateIndex
CREATE INDEX "Hazard_reviewStatus_dangerLevel_idx" ON "Hazard"("reviewStatus", "dangerLevel");

-- CreateIndex
CREATE INDEX "Hazard_category_idx" ON "Hazard"("category");

-- CreateIndex
CREATE INDEX "QuizQuestion_reviewStatus_type_idx" ON "QuizQuestion"("reviewStatus", "type");

-- CreateIndex
CREATE INDEX "ReviewRecord_contentKind_contentId_idx" ON "ReviewRecord"("contentKind", "contentId");

-- CreateIndex
CREATE INDEX "ReviewRecord_createdAt_idx" ON "ReviewRecord"("createdAt");

-- CreateIndex
CREATE INDEX "ContentTag_kind_tag_idx" ON "ContentTag"("kind", "tag");

-- CreateIndex
CREATE UNIQUE INDEX "ContentTag_kind_contentId_tag_key" ON "ContentTag"("kind", "contentId", "tag");

-- CreateIndex
CREATE INDEX "Bookmark_userId_idx" ON "Bookmark"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Bookmark_userId_kind_refId_key" ON "Bookmark"("userId", "kind", "refId");

-- CreateIndex
CREATE INDEX "ReadingHistory_userId_at_idx" ON "ReadingHistory"("userId", "at");

-- CreateIndex
CREATE UNIQUE INDEX "ReadingHistory_userId_refId_key" ON "ReadingHistory"("userId", "refId");

-- CreateIndex
CREATE INDEX "UserNote_userId_idx" ON "UserNote"("userId");

-- CreateIndex
CREATE INDEX "InventoryEntry_userId_idx" ON "InventoryEntry"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryEntry_userId_supplyId_key" ON "InventoryEntry"("userId", "supplyId");

-- CreateIndex
CREATE INDEX "InventoryTransaction_userId_idx" ON "InventoryTransaction"("userId");

-- CreateIndex
CREATE INDEX "InventoryTransaction_entryId_idx" ON "InventoryTransaction"("entryId");

-- CreateIndex
CREATE UNIQUE INDEX "SurvivalProfile_userId_key" ON "SurvivalProfile"("userId");

-- CreateIndex
CREATE INDEX "QuizRecord_userId_at_idx" ON "QuizRecord"("userId", "at");

-- CreateIndex
CREATE INDEX "AIConversation_userId_idx" ON "AIConversation"("userId");

-- CreateIndex
CREATE INDEX "AIMessage_conversationId_idx" ON "AIMessage"("conversationId");

-- CreateIndex
CREATE INDEX "MapMarker_userId_idx" ON "MapMarker"("userId");

-- CreateIndex
CREATE INDEX "MapRoute_userId_idx" ON "MapRoute"("userId");

-- CreateIndex
CREATE INDEX "OfflinePackage_userId_idx" ON "OfflinePackage"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "OfflinePackage_userId_name_key" ON "OfflinePackage"("userId", "name");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "EmergencyContact_userId_idx" ON "EmergencyContact"("userId");

-- CreateIndex
CREATE INDEX "AIUsageLog_createdAt_idx" ON "AIUsageLog"("createdAt");

-- CreateIndex
CREATE INDEX "AIUsageLog_userId_idx" ON "AIUsageLog"("userId");

-- AddForeignKey
ALTER TABLE "UserSession" ADD CONSTRAINT "UserSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnimalTrack" ADD CONSTRAINT "AnimalTrack_animalId_fkey" FOREIGN KEY ("animalId") REFERENCES "Animal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScenarioStep" ADD CONSTRAINT "ScenarioStep_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "Scenario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScenarioChoice" ADD CONSTRAINT "ScenarioChoice_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "ScenarioStep"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReadingHistory" ADD CONSTRAINT "ReadingHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserNote" ADD CONSTRAINT "UserNote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryEntry" ADD CONSTRAINT "InventoryEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryTransaction" ADD CONSTRAINT "InventoryTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryTransaction" ADD CONSTRAINT "InventoryTransaction_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "InventoryEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurvivalProfile" ADD CONSTRAINT "SurvivalProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizRecord" ADD CONSTRAINT "QuizRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIConversation" ADD CONSTRAINT "AIConversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIMessage" ADD CONSTRAINT "AIMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "AIConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MapMarker" ADD CONSTRAINT "MapMarker_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MapRoute" ADD CONSTRAINT "MapRoute_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfflinePackage" ADD CONSTRAINT "OfflinePackage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmergencyContact" ADD CONSTRAINT "EmergencyContact_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIUsageLog" ADD CONSTRAINT "AIUsageLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

