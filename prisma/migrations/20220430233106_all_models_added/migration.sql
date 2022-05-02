/*
  Warnings:

  - The primary key for the `Module` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Module` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Module` table. All the data in the column will be lost.
  - You are about to drop the `Student` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Study` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `module_id` to the `Module` table without a default value. This is not possible if the table is not empty.
  - Added the required column `module_name` to the `Module` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Study" DROP CONSTRAINT "Study_moduleId_fkey";

-- DropForeignKey
ALTER TABLE "Study" DROP CONSTRAINT "Study_studentId_fkey";

-- AlterTable
ALTER TABLE "Module" DROP CONSTRAINT "Module_pkey",
DROP COLUMN "id",
DROP COLUMN "name",
ADD COLUMN     "module_id" VARCHAR(30) NOT NULL,
ADD COLUMN     "module_name" VARCHAR(255) NOT NULL,
ADD CONSTRAINT "Module_pkey" PRIMARY KEY ("module_id");

-- DropTable
DROP TABLE "Student";

-- DropTable
DROP TABLE "Study";

-- CreateTable
CREATE TABLE "Grade" (
    "grade_id" VARCHAR(30) NOT NULL,
    "nombre_surveillances" INTEGER NOT NULL,

    CONSTRAINT "Grade_pkey" PRIMARY KEY ("grade_id")
);

-- CreateTable
CREATE TABLE "Enseignant" (
    "enseignant_id" VARCHAR(30) NOT NULL,
    "enseignant_first_name" VARCHAR(100) NOT NULL,
    "enseignant_last_name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "grade_id" VARCHAR(30) NOT NULL,

    CONSTRAINT "Enseignant_pkey" PRIMARY KEY ("enseignant_id")
);

-- CreateTable
CREATE TABLE "Departement" (
    "departement_id" VARCHAR(255) NOT NULL,
    "deparement_name" VARCHAR(255) NOT NULL,

    CONSTRAINT "Departement_pkey" PRIMARY KEY ("departement_id")
);

-- CreateTable
CREATE TABLE "Specialite" (
    "specialite_id" VARCHAR(30) NOT NULL,
    "departement_id" VARCHAR(255) NOT NULL,

    CONSTRAINT "Specialite_pkey" PRIMARY KEY ("specialite_id")
);

-- CreateTable
CREATE TABLE "Section" (
    "section_id" VARCHAR(30) NOT NULL,
    "section_code" VARCHAR(1) NOT NULL,
    "anneeEtude" INTEGER NOT NULL,
    "specialite_id" VARCHAR(30) NOT NULL,

    CONSTRAINT "Section_pkey" PRIMARY KEY ("section_id")
);

-- CreateTable
CREATE TABLE "ModuleSpecialite" (
    "module_id" VARCHAR(30) NOT NULL,
    "specialite_id" VARCHAR(30) NOT NULL,
    "anneeEtude" INTEGER NOT NULL,
    "semestre" INTEGER NOT NULL,

    CONSTRAINT "ModuleSpecialite_pkey" PRIMARY KEY ("module_id","specialite_id")
);

-- CreateTable
CREATE TABLE "Creneau" (
    "creneau_id" BIGSERIAL NOT NULL,
    "date" DATE NOT NULL,
    "start_time" TIMESTAMP NOT NULL,
    "end_time" TIMESTAMP NOT NULL,

    CONSTRAINT "Creneau_pkey" PRIMARY KEY ("creneau_id")
);

-- CreateTable
CREATE TABLE "Local" (
    "code_local" VARCHAR(10) NOT NULL,
    "capacite" INTEGER NOT NULL,

    CONSTRAINT "Local_pkey" PRIMARY KEY ("code_local")
);

-- CreateTable
CREATE TABLE "Reservation" (
    "creneau_id" BIGINT NOT NULL,
    "code_local" VARCHAR(10) NOT NULL,
    "disponible" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Reservation_pkey" PRIMARY KEY ("creneau_id","code_local")
);

-- CreateTable
CREATE TABLE "Examen" (
    "examen_id" BIGSERIAL NOT NULL,
    "module_id" VARCHAR(30) NOT NULL,
    "section_id" VARCHAR(30) NOT NULL,
    "creneau_id" BIGINT NOT NULL,

    CONSTRAINT "Examen_pkey" PRIMARY KEY ("examen_id")
);

-- CreateTable
CREATE TABLE "LocalExamen" (
    "local_examen_id" BIGSERIAL NOT NULL,
    "code_local" VARCHAR(10) NOT NULL,
    "examen_id" BIGINT NOT NULL,

    CONSTRAINT "LocalExamen_pkey" PRIMARY KEY ("local_examen_id")
);

-- CreateTable
CREATE TABLE "Surveillance" (
    "enseignant_id" VARCHAR(30) NOT NULL,
    "local_examen_id" BIGINT NOT NULL,

    CONSTRAINT "Surveillance_pkey" PRIMARY KEY ("enseignant_id","local_examen_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Enseignant_email_key" ON "Enseignant"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Examen_module_id_section_id_creneau_id_key" ON "Examen"("module_id", "section_id", "creneau_id");

-- CreateIndex
CREATE UNIQUE INDEX "Examen_module_id_section_id_key" ON "Examen"("module_id", "section_id");

-- CreateIndex
CREATE UNIQUE INDEX "Examen_section_id_creneau_id_key" ON "Examen"("section_id", "creneau_id");

-- CreateIndex
CREATE UNIQUE INDEX "LocalExamen_code_local_examen_id_key" ON "LocalExamen"("code_local", "examen_id");

-- AddForeignKey
ALTER TABLE "Enseignant" ADD CONSTRAINT "Enseignant_grade_id_fkey" FOREIGN KEY ("grade_id") REFERENCES "Grade"("grade_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Specialite" ADD CONSTRAINT "Specialite_departement_id_fkey" FOREIGN KEY ("departement_id") REFERENCES "Departement"("departement_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_specialite_id_fkey" FOREIGN KEY ("specialite_id") REFERENCES "Specialite"("specialite_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModuleSpecialite" ADD CONSTRAINT "ModuleSpecialite_specialite_id_fkey" FOREIGN KEY ("specialite_id") REFERENCES "Specialite"("specialite_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModuleSpecialite" ADD CONSTRAINT "ModuleSpecialite_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "Module"("module_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_creneau_id_fkey" FOREIGN KEY ("creneau_id") REFERENCES "Creneau"("creneau_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_code_local_fkey" FOREIGN KEY ("code_local") REFERENCES "Local"("code_local") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Examen" ADD CONSTRAINT "Examen_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "Section"("section_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Examen" ADD CONSTRAINT "Examen_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "Module"("module_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Examen" ADD CONSTRAINT "Examen_creneau_id_fkey" FOREIGN KEY ("creneau_id") REFERENCES "Creneau"("creneau_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocalExamen" ADD CONSTRAINT "LocalExamen_code_local_fkey" FOREIGN KEY ("code_local") REFERENCES "Local"("code_local") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocalExamen" ADD CONSTRAINT "LocalExamen_examen_id_fkey" FOREIGN KEY ("examen_id") REFERENCES "Examen"("examen_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Surveillance" ADD CONSTRAINT "Surveillance_enseignant_id_fkey" FOREIGN KEY ("enseignant_id") REFERENCES "Enseignant"("enseignant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Surveillance" ADD CONSTRAINT "Surveillance_local_examen_id_fkey" FOREIGN KEY ("local_examen_id") REFERENCES "LocalExamen"("local_examen_id") ON DELETE RESTRICT ON UPDATE CASCADE;
