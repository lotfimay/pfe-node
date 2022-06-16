const express = require('express');

const enseignantController = require('../controllers/EnseignantController')

const enseignantMiddlewares = require('../middlewares/EnseignantMiddlewares');



const router = express.Router();






router.get('/' ,enseignantController.enseignant_index);



router.get('/generer-convocations' ,enseignantMiddlewares.check_user_2 ,enseignantController.enseignant_convocation);


router.get('/generer-convocations/:semestre/:session/' , enseignantMiddlewares.check_user_2, enseignantController.enseignant_convocation_semestre_session);

router.get('/ajouter-enseignant' ,enseignantMiddlewares.check_user ,enseignantController.enseignant_ajouter_enseignant);

router.post('/ajouter-enseignant' , enseignantMiddlewares.check_user, enseignantController.enseignant_ajouter_enseignant_post);

router.get('/:enseignant_id' ,enseignantMiddlewares.check_user ,enseignantController.enseignant_profile);


router.post('/:enseignant_id' , enseignantMiddlewares.check_user,enseignantController.enseignant_profile_post);

router.get('/:enseignant_id/delete' , enseignantMiddlewares.check_user,enseignantController.enseignant_profile_delete);





module.exports = router;





