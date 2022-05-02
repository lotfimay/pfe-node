/*
  Warnings:

  - You are about to drop the `Creneau` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Departement` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Enseignant` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Examen` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Grade` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Local` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LocalExamen` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Module` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ModuleSpecialite` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Reservation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Section` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Specialite` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Surveillance` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Enseignant" DROP CONSTRAINT "Enseignant_grade_id_fkey";

-- DropForeignKey
ALTER TABLE "Examen" DROP CONSTRAINT "Examen_creneau_id_fkey";

-- DropForeignKey
ALTER TABLE "Examen" DROP CONSTRAINT "Examen_module_id_fkey";

-- DropForeignKey
ALTER TABLE "Examen" DROP CONSTRAINT "Examen_section_id_fkey";

-- DropForeignKey
ALTER TABLE "LocalExamen" DROP CONSTRAINT "LocalExamen_code_local_fkey";

-- DropForeignKey
ALTER TABLE "LocalExamen" DROP CONSTRAINT "LocalExamen_examen_id_fkey";

-- DropForeignKey
ALTER TABLE "ModuleSpecialite" DROP CONSTRAINT "ModuleSpecialite_module_id_fkey";

-- DropForeignKey
ALTER TABLE "ModuleSpecialite" DROP CONSTRAINT "ModuleSpecialite_specialite_id_fkey";

-- DropForeignKey
ALTER TABLE "Reservation" DROP CONSTRAINT "Reservation_code_local_fkey";

-- DropForeignKey
ALTER TABLE "Reservation" DROP CONSTRAINT "Reservation_creneau_id_fkey";

-- DropForeignKey
ALTER TABLE "Section" DROP CONSTRAINT "Section_specialite_id_fkey";

-- DropForeignKey
ALTER TABLE "Specialite" DROP CONSTRAINT "Specialite_departement_id_fkey";

-- DropForeignKey
ALTER TABLE "Surveillance" DROP CONSTRAINT "Surveillance_enseignant_id_fkey";

-- DropForeignKey
ALTER TABLE "Surveillance" DROP CONSTRAINT "Surveillance_local_examen_id_fkey";

-- DropTable
DROP TABLE "Creneau";

-- DropTable
DROP TABLE "Departement";

-- DropTable
DROP TABLE "Enseignant";

-- DropTable
DROP TABLE "Examen";

-- DropTable
DROP TABLE "Grade";

-- DropTable
DROP TABLE "Local";

-- DropTable
DROP TABLE "LocalExamen";

-- DropTable
DROP TABLE "Module";

-- DropTable
DROP TABLE "ModuleSpecialite";

-- DropTable
DROP TABLE "Reservation";

-- DropTable
DROP TABLE "Section";

-- DropTable
DROP TABLE "Specialite";

-- DropTable
DROP TABLE "Surveillance";
