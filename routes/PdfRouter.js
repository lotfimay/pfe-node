const express = require('express');
const router = express.Router();


const pdfController = require('../controllers/PdfController');

const pdfMiddlewares = require('../middlewares/pdfMiddlewares');



router.get('/:section_id/:module_id/:session_id/pvexamen' , pdfMiddlewares.check_user , pdfController.pv_examen);

router.get('/:semestre/:session/:enseignant_id/convocation' ,pdfMiddlewares.check_user ,pdfController.convocation);

router.get('/:semestre/:session/:section_id/plannings' , pdfMiddlewares.check_user_2,pdfController.plannings);



module.exports = router;