const express = require('express');

const espaceEnseignantController = require('../controllers/EspaceEnseignantController');

const router = express.Router();

router.get(''  ,espaceEnseignantController.espace_enseignant_index);

router.get('/generer-convocations' , espaceEnseignantController.espace_enseignant_convocations);
router.get('/generer-pvs' , espaceEnseignantController.espace_eseignant_pvs);

router.get('/consulter' , espaceEnseignantController.espace_enseignant_consulter);

router.get('/consulter/:semestre/:session/:section_id' , espaceEnseignantController.espace_enseignant_plannings);


module.exports = router;