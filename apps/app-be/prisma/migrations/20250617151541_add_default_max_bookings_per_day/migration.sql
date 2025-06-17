-- Update existing NULL values to 10
UPDATE "Service" SET "maxBookingsPerDay" = 10 WHERE "maxBookingsPerDay" IS NULL;

-- AlterTable
ALTER TABLE "Service" ALTER COLUMN "maxBookingsPerDay" SET NOT NULL,
ALTER COLUMN "maxBookingsPerDay" SET DEFAULT 10;
