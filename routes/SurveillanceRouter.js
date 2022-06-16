const express = require('express');
const router = express.Router();

const surveillanceController = require('../controllers/SurveillanceController');
const surveillanceMiddleware = require('../middlewares/SurveillanceMiddlewares');
const globalMiddlewares = require('../middlewares/globalMiddlewares')


router.get('' , surveillanceController.surveillance_index);

router.get('/consulter' ,surveillanceController.surveillance_pre_consultaion);

router.get('/:semestre_id/:session_id/:section_id/:module_id' ,surveillanceMiddleware.check_user , globalMiddlewares.check_departement_coherence,surveillanceController.surveillance_module);

router.get('/consulter/:semestre_id/:session_id/:section_id/:module_id' , surveillanceMiddleware.check_user_2 , surveillanceMiddleware.check_user_3 ,surveillanceController.surveillance_consultation);

router.get('/:semestre_id/:session_id/:section_id/:module_id/:local_id' ,surveillanceMiddleware.check_user,globalMiddlewares.check_departement_coherence ,surveillanceController.surveillance_local);

router.post('/:semestre_id/:session_id/:section_id/:module_id/:local_id' , surveillanceMiddleware.check_user,globalMiddlewares.check_departement_coherence,surveillanceController.surveillance_local_post);






module.exports = router;