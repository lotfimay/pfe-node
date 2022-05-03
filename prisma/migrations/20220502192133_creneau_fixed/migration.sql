/*
  Warnings:

  - The primary key for the `Creneau` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Examen` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `date` on the `Examen` table. All the data in the column will be lost.
  - You are about to drop the column `end_time` on the `Examen` table. All the data in the column will be lost.
  - You are about to drop the column `start_time` on the `Examen` table. All the data in the column will be lost.
  - The primary key for the `LocalExamen` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `date` on the `LocalExamen` table. All the data in the column will be lost.
  - You are about to drop the column `end_time` on the `LocalExamen` table. All the data in the column will be lost.
  - You are about to drop the column `start_time` on the `LocalExamen` table. All the data in the column will be lost.
  - The primary key for the `Reservation` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `date` on the `Reservation` table. All the data in the column will be lost.
  - You are about to drop the column `end_time` on the `Reservation` table. All the data in the column will be lost.
  - You are about to drop the column `start_time` on the `Reservation` table. All the data in the column will be lost.
  - The primary key for the `Surveillance` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `date` on the `Surveillance` table. All the data in the column will be lost.
  - You are about to drop the column `end_time` on the `Surveillance` table. All the data in the column will be lost.
  - You are about to drop the column `start_time` on the `Surveillance` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[date,start_time,end_time]` on the table `Creneau` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code_section,code_creneau]` on the table `Examen` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code_creneau,code_local]` on the table `LocalExamen` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code_enseignant,code_creneau]` on the table `Surveillance` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code_creneau` to the `Examen` table without a default value. This is not possible if the table is not empty.
  - Added the required column `code_creneau` to the `LocalExamen` table without a default value. This is not possible if the table is not empty.
  - Added the required column `code_creneau` to the `Reservation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `code_creneau` to the `Surveillance` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Examen" DROP CONSTRAINT "FK_EXAMEN_CRENEAU";

-- DropForeignKey
ALTER TABLE "LocalExamen" DROP CONSTRAINT "FK_LOCALEXAMEN_EXAMEN";

-- DropForeignKey
ALTER TABLE "Reservation" DROP CONSTRAINT "FK_RESERVATION_CRENEAU";

-- DropForeignKey
ALTER TABLE "Surveillance" DROP CONSTRAINT "FK_SURVEILLANCE_LOCALEXAMEN";

-- DropIndex
DROP INDEX "UNIQUE_SECTION_CRENEAU";

-- DropIndex
DROP INDEX "UNIQUE_CRENEAU_LOCAL";

-- DropIndex
DROP INDEX "UNIQUE_ENSEIGNANT_CRENEAU";

-- AlterTable
ALTER TABLE "Creneau" DROP CONSTRAINT "PK_CRENEAU",
ADD COLUMN     "code_creneau" BIGSERIAL NOT NULL,
ADD CONSTRAINT "PK_CRENEAU" PRIMARY KEY ("code_creneau");

-- AlterTable
ALTER TABLE "Examen" DROP CONSTRAINT "PK_EXAMEN",
DROP COLUMN "date",
DROP COLUMN "end_time",
DROP COLUMN "start_time",
ADD COLUMN     "code_creneau" BIGINT NOT NULL,
ADD CONSTRAINT "PK_EXAMEN" PRIMARY KEY ("code_module", "code_section", "code_creneau");

-- AlterTable
ALTER TABLE "LocalExamen" DROP CONSTRAINT "PK_LOCALEXAMEN",
DROP COLUMN "date",
DROP COLUMN "end_time",
DROP COLUMN "start_time",
ADD COLUMN     "code_creneau" BIGINT NOT NULL,
ADD CONSTRAINT "PK_LOCALEXAMEN" PRIMARY KEY ("code_local", "code_module", "code_section", "code_creneau");

-- AlterTable
ALTER TABLE "Reservation" DROP CONSTRAINT "PK_RESERVATION",
DROP COLUMN "date",
DROP COLUMN "end_time",
DROP COLUMN "start_time",
ADD COLUMN     "code_creneau" BIGINT NOT NULL,
ADD CONSTRAINT "PK_RESERVATION" PRIMARY KEY ("code_creneau", "code_local");

-- AlterTable
ALTER TABLE "Surveillance" DROP CONSTRAINT "PK_SURVEILLANCE",
DROP COLUMN "date",
DROP COLUMN "end_time",
DROP COLUMN "start_time",
ADD COLUMN     "code_creneau" BIGINT NOT NULL,
ADD CONSTRAINT "PK_SURVEILLANCE" PRIMARY KEY ("code_enseignant", "code_local", "code_module", "code_section", "code_creneau");

-- CreateIndex
CREATE UNIQUE INDEX "UNIQUE_CRENEAU" ON "Creneau"("date", "start_time", "end_time");

-- CreateIndex
CREATE UNIQUE INDEX "UNIQUE_SECTION_CRENEAU" ON "Examen"("code_section", "code_creneau");

-- CreateIndex
CREATE UNIQUE INDEX "UNIQUE_CRENEAU_LOCAL" ON "LocalExamen"("code_creneau", "code_local");

-- CreateIndex
CREATE UNIQUE INDEX "UNIQUE_ENSEIGNANT_CRENEAU" ON "Surveillance"("code_enseignant", "code_creneau");

-- AddForeignKey
ALTER TABLE "Examen" ADD CONSTRAINT "FK_EXAMEN_CRENEAU" FOREIGN KEY ("code_creneau") REFERENCES "Creneau"("code_creneau") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "LocalExamen" ADD CONSTRAINT "FK_LOCALEXAMEN_EXAMEN" FOREIGN KEY ("code_module", "code_section", "code_creneau") REFERENCES "Examen"("code_module", "code_section", "code_creneau") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "FK_RESERVATION_CRENEAU" FOREIGN KEY ("code_creneau") REFERENCES "Creneau"("code_creneau") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Surveillance" ADD CONSTRAINT "FK_SURVEILLANCE_LOCALEXAMEN" FOREIGN KEY ("code_local", "code_module", "code_section", "code_creneau") REFERENCES "LocalExamen"("code_local", "code_module", "code_section", "code_creneau") ON DELETE CASCADE ON UPDATE NO ACTION;
