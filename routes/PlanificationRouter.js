const express = require('express');
const router = express.Router();

const planificationController = require('../controllers/PlanificationController');
const globalMiddleware = require("../middlewares/globalMiddlewares");






router.get('/' , globalMiddleware.check_ia_si ,planificationController.planification_index);

router.get('/update' , globalMiddleware.check_ia_si ,planificationController.planification_update);



router.get('/update/:semestre/:session/:section_id/'  , globalMiddleware.check_ia_si ,globalMiddleware.check_departement_coherence , planificationController.planification_update_section);
router.get('/consulter' , planificationController.planification_pre_consultation);
// add middleware


// move middleware
router.get('/consulter/:semestre/:session/:section_id' ,planificationController.planification_consultation);

router.get('/update/:semestre/:session/:section_id/:module_id'   ,globalMiddleware.check_ia_si , globalMiddleware.check_departement_coherence,planificationController.planification_update_module);

router.post('/update/:semestre/:session/:section_id/:module_id' ,globalMiddleware.check_ia_si , globalMiddleware.check_departement_coherence,planificationController.planification_update_module_post);

router.get('/:semestre/:session/:section_id' , globalMiddleware.check_ia_si ,globalMiddleware.check_departement_coherence ,planificationController.planification_section);

router.get('/:semestre/:session/:section_id/:module_id' , globalMiddleware.check_ia_si ,globalMiddleware.check_departement_coherence ,planificationController.planification_module);

router.post('/:semestre/:session/:section_id/:module_id' , globalMiddleware.check_ia_si,globalMiddleware.check_departement_coherence ,planificationController.planification_module_post);

module.exports = router;