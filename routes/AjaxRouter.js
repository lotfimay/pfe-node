const express = require('express');


const ajaxController = require('../controllers/AjaxController');

const router = express.Router();

router.get('/locaux_disponibles' , ajaxController.locaux_disponibles);


router.get('/update_planification' , ajaxController.update_planification);

router.get('/specialites_par__palier', ajaxController.specialites_par_palier);

router.get('/sections_par_niveau' , ajaxController.sections_par_niveau);

router.get('/modules__par__section' , ajaxController.modules_par_section);

router.delete('/examen' , ajaxController.delete_examen);
router.delete('/enseignant' , ajaxController.delete_enseignant);

router.get('/verify_convocation' , ajaxController.verify_convocation);

router.get('/email__enseignant' ,  ajaxController.email__enseignant);

router.get('/pv__modules' , ajaxController.pv_modules);

module.exports = router;