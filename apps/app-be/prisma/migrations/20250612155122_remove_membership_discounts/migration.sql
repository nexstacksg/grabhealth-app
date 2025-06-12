/*
  Warnings:

  - You are about to drop the column `discount` on the `MembershipTier` table. All the data in the column will be lost.
  - You are about to drop the column `discountEssential` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `discountPremium` on the `Product` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MembershipTier" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" REAL NOT NULL DEFAULT 0,
    "benefits" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_MembershipTier" ("benefits", "createdAt", "description", "id", "name", "price", "updatedAt") SELECT "benefits", "createdAt", "description", "id", "name", "price", "updatedAt" FROM "MembershipTier";
DROP TABLE "MembershipTier";
ALTER TABLE "new_MembershipTier" RENAME TO "MembershipTier";
CREATE UNIQUE INDEX "MembershipTier_name_key" ON "MembershipTier"("name");
CREATE TABLE "new_Product" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" REAL NOT NULL,
    "categoryId" INTEGER,
    "imageUrl" TEXT,
    "inStock" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Product" ("categoryId", "createdAt", "description", "id", "imageUrl", "inStock", "name", "price", "status", "updatedAt") SELECT "categoryId", "createdAt", "description", "id", "imageUrl", "inStock", "name", "price", "status", "updatedAt" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE INDEX "Product_categoryId_idx" ON "Product"("categoryId");
CREATE INDEX "Product_status_idx" ON "Product"("status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
