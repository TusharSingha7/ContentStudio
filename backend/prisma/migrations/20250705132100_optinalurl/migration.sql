-- AlterTable
ALTER TABLE "Project" ALTER COLUMN "link" DROP NOT NULL,
ALTER COLUMN "thumailurl" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "avatarUrl" DROP NOT NULL;
