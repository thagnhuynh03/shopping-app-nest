/*
  Warnings:

  - Changed the type of `city` on the `Address` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `country` on the `Address` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `district` on the `Address` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `ward` on the `Address` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Address" DROP COLUMN "city",
ADD COLUMN     "city" INTEGER NOT NULL,
DROP COLUMN "country",
ADD COLUMN     "country" INTEGER NOT NULL,
DROP COLUMN "district",
ADD COLUMN     "district" INTEGER NOT NULL,
DROP COLUMN "ward",
ADD COLUMN     "ward" INTEGER NOT NULL;
