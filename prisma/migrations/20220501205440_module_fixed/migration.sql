-- CreateTable
CREATE TABLE "Creneau" (
    "date" DATE NOT NULL,
    "start_time" TIMESTAMP(6) NOT NULL,
    "end_time" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "PK_CRENEAU" PRIMARY KEY ("date","start_time","end_time")
);

-- CreateTable
CREATE TABLE "Departement" (
    "code_departement" VARCHAR(255) NOT NULL,
    "nom_departement" VARCHAR(255) NOT NULL,

    CONSTRAINT "PK_DEPARTEMENT" PRIMARY KEY ("code_departement")
);

-- CreateTable
CREATE TABLE "Enseignant" (
    "code_enseignant" VARCHAR(30) NOT NULL,
    "nom_enseignant" VARCHAR(100) NOT NULL,
    "prenom_enseignant" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "telephone_1" VARCHAR(10),
    "telephone_2" VARCHAR(10),
    "code_grade" VARCHAR(30) NOT NULL,

    CONSTRAINT "PK_ENSEIGNANT" PRIMARY KEY ("code_enseignant")
);

-- CreateTable
CREATE TABLE "Examen" (
    "code_module" VARCHAR(30) NOT NULL,
    "code_section" VARCHAR(30) NOT NULL,
    "date" DATE NOT NULL,
    "start_time" TIMESTAMP(6) NOT NULL,
    "end_time" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "PK_EXAMEN" PRIMARY KEY ("code_module","code_section","date","start_time","end_time")
);

-- CreateTable
CREATE TABLE "Grade" (
    "code_grade" VARCHAR(30) NOT NULL,
    "nombre_surveillances" INTEGER NOT NULL,

    CONSTRAINT "PK_GRADE" PRIMARY KEY ("code_grade")
);

-- CreateTable
CREATE TABLE "Local" (
    "code_local" VARCHAR(10) NOT NULL,
    "capacite" INTEGER NOT NULL,

    CONSTRAINT "PK_LOCAL" PRIMARY KEY ("code_local")
);

-- CreateTable
CREATE TABLE "LocalExamen" (
    "code_local" VARCHAR(10) NOT NULL,
    "code_module" VARCHAR(30) NOT NULL,
    "code_section" VARCHAR(30) NOT NULL,
    "date" DATE NOT NULL,
    "start_time" TIMESTAMP(6) NOT NULL,
    "end_time" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "PK_LOCALEXAMEN" PRIMARY KEY ("code_local","code_module","code_section","date","start_time","end_time")
);

-- CreateTable
CREATE TABLE "Module" (
    "code_module" VARCHAR(30) NOT NULL,
    "nom_module" VARCHAR(255) NOT NULL,

    CONSTRAINT "PK_MODULE" PRIMARY KEY ("code_module")
);

-- CreateTable
CREATE TABLE "ModuleSpecialite" (
    "code_module" VARCHAR(30) NOT NULL,
    "code_specialite" VARCHAR(30) NOT NULL,
    "anneeEtude" INTEGER NOT NULL,
    "semestre" INTEGER NOT NULL,
    "fondamental" BOOLEAN NOT NULL,

    CONSTRAINT "PK_MODULESPECIALITE" PRIMARY KEY ("code_module","code_specialite")
);

-- CreateTable
CREATE TABLE "Reservation" (
    "date" DATE NOT NULL,
    "start_time" TIMESTAMP(6) NOT NULL,
    "end_time" TIMESTAMP(6) NOT NULL,
    "code_local" VARCHAR(10) NOT NULL,
    "disponible" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "PK_RESERVATION" PRIMARY KEY ("date","start_time","end_time","code_local")
);

-- CreateTable
CREATE TABLE "Section" (
    "code_section" VARCHAR(30) NOT NULL,
    "nom_section" VARCHAR(1) NOT NULL,
    "anneeEtude" INTEGER NOT NULL,
    "code_specialite" VARCHAR(30) NOT NULL,

    CONSTRAINT "PK_SECTION" PRIMARY KEY ("code_section")
);

-- CreateTable
CREATE TABLE "Specialite" (
    "code_specialite" VARCHAR(30) NOT NULL,
    "nom_specialite" VARCHAR(255) NOT NULL,
    "code_departement" VARCHAR(255) NOT NULL,
    "palier" VARCHAR(255) NOT NULL,

    CONSTRAINT "PK_SPECIALITE" PRIMARY KEY ("code_specialite")
);

-- CreateTable
CREATE TABLE "Surveillance" (
    "code_enseignant" VARCHAR(30) NOT NULL,
    "code_local" VARCHAR(10) NOT NULL,
    "code_module" VARCHAR(30) NOT NULL,
    "code_section" VARCHAR(30) NOT NULL,
    "date" DATE NOT NULL,
    "start_time" TIMESTAMP(6) NOT NULL,
    "end_time" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "PK_SURVEILLANCE" PRIMARY KEY ("code_enseignant","code_local","code_module","code_section","date","start_time","end_time")
);

-- CreateIndex
CREATE UNIQUE INDEX "UNIQUE_EMAIL" ON "Enseignant"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UNIQUE_SECTION_CRENEAU" ON "Examen"("code_section", "date", "start_time", "end_time");

-- CreateIndex
CREATE UNIQUE INDEX "UNIQUE_SECTION_MODULE" ON "Examen"("code_section", "code_module");

-- CreateIndex
CREATE UNIQUE INDEX "UNIQUE_CRENEAU_LOCAL" ON "LocalExamen"("date", "start_time", "end_time", "code_local");

-- CreateIndex
CREATE UNIQUE INDEX "UNIQUE_ENSEIGNANT_CRENEAU" ON "Surveillance"("code_enseignant", "date", "start_time", "end_time");

-- AddForeignKey
ALTER TABLE "Enseignant" ADD CONSTRAINT "FK_ENSEIGNANT_GRADE" FOREIGN KEY ("code_grade") REFERENCES "Grade"("code_grade") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Examen" ADD CONSTRAINT "FK_EXAMEN_CRENEAU" FOREIGN KEY ("date", "start_time", "end_time") REFERENCES "Creneau"("date", "start_time", "end_time") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Examen" ADD CONSTRAINT "FK_EXAMEN_MODULE" FOREIGN KEY ("code_module") REFERENCES "Module"("code_module") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Examen" ADD CONSTRAINT "FK_EXAMEN_SECTION" FOREIGN KEY ("code_section") REFERENCES "Section"("code_section") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "LocalExamen" ADD CONSTRAINT "FK_LOCALEXAMEN_EXAMEN" FOREIGN KEY ("code_module", "code_section", "date", "start_time", "end_time") REFERENCES "Examen"("code_module", "code_section", "date", "start_time", "end_time") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "LocalExamen" ADD CONSTRAINT "FK_LOCAEXAMEN_LOCAL" FOREIGN KEY ("code_local") REFERENCES "Local"("code_local") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ModuleSpecialite" ADD CONSTRAINT "FK_MODULESPECIALITE_MODULE" FOREIGN KEY ("code_module") REFERENCES "Module"("code_module") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ModuleSpecialite" ADD CONSTRAINT "FK_MODULESPECIALITE_SPECIALITE" FOREIGN KEY ("code_specialite") REFERENCES "Specialite"("code_specialite") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "FK_RESERVATION_CRENEAU" FOREIGN KEY ("date", "start_time", "end_time") REFERENCES "Creneau"("date", "start_time", "end_time") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "FK_RESERVATION_LOCAL" FOREIGN KEY ("code_local") REFERENCES "Local"("code_local") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "FK_SECTION_SPECIALITE" FOREIGN KEY ("code_specialite") REFERENCES "Specialite"("code_specialite") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Specialite" ADD CONSTRAINT "FK_SPECIALITE_DEPARTEMENT" FOREIGN KEY ("code_departement") REFERENCES "Departement"("code_departement") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Surveillance" ADD CONSTRAINT "FK_SURVEILLANCE_ENSEINGNANT" FOREIGN KEY ("code_enseignant") REFERENCES "Enseignant"("code_enseignant") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Surveillance" ADD CONSTRAINT "FK_SURVEILLANCE_LOCALEXAMEN" FOREIGN KEY ("code_local", "code_module", "code_section", "date", "start_time", "end_time") REFERENCES "LocalExamen"("code_local", "code_module", "code_section", "date", "start_time", "end_time") ON DELETE CASCADE ON UPDATE NO ACTION;
