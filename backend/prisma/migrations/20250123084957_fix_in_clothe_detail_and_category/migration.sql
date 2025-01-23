/*
  Warnings:

  - You are about to drop the column `clotheId` on the `Clothe_Details` table. All the data in the column will be lost.
  - You are about to drop the column `imageId` on the `Clothe_Details` table. All the data in the column will be lost.
  - You are about to drop the column `stock` on the `Clothe_Details` table. All the data in the column will be lost.
  - You are about to drop the `Color` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Image` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ClotheColors` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_imageName` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `categoryId` to the `Clothe_Details` table without a default value. This is not possible if the table is not empty.
  - Added the required column `color` to the `Clothe_Details` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Clothe_Details" DROP CONSTRAINT "Clothe_Details_clotheId_fkey";

-- DropForeignKey
ALTER TABLE "_ClotheColors" DROP CONSTRAINT "_ClotheColors_A_fkey";

-- DropForeignKey
ALTER TABLE "_ClotheColors" DROP CONSTRAINT "_ClotheColors_B_fkey";

-- DropForeignKey
ALTER TABLE "_imageName" DROP CONSTRAINT "_imageName_A_fkey";

-- DropForeignKey
ALTER TABLE "_imageName" DROP CONSTRAINT "_imageName_B_fkey";

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "imageUrl" TEXT[];

-- AlterTable
ALTER TABLE "Clothe_Details" DROP COLUMN "clotheId",
DROP COLUMN "imageId",
DROP COLUMN "stock",
ADD COLUMN     "categoryId" INTEGER NOT NULL,
ADD COLUMN     "color" TEXT NOT NULL,
ADD COLUMN     "imageUrl" TEXT[];

-- DropTable
DROP TABLE "Color";

-- DropTable
DROP TABLE "Image";

-- DropTable
DROP TABLE "_ClotheColors";

-- DropTable
DROP TABLE "_imageName";

-- AddForeignKey
ALTER TABLE "Clothe_Details" ADD CONSTRAINT "Clothe_Details_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
