/*
  Warnings:

  - You are about to drop the column `board` on the `GameSession` table. All the data in the column will be lost.
  - Added the required column `currentBoard` to the `GameSession` table without a default value. This is not possible if the table is not empty.
  - Added the required column `initialBoard` to the `GameSession` table without a default value. This is not possible if the table is not empty.
  - Added the required column `solvedBoard` to the `GameSession` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "GameSession" DROP COLUMN "board",
ADD COLUMN     "currentBoard" JSONB NOT NULL,
ADD COLUMN     "initialBoard" JSONB NOT NULL,
ADD COLUMN     "solvedBoard" JSONB NOT NULL;
