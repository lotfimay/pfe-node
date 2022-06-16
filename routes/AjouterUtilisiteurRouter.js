const express = require('express');
const router = express.Router();



const ajouterUtilisateurController = require('../controllers/AjouterUtilisateurController');


router.get('' , ajouterUtilisateurController.ajouter_utilisateur);
router.post('' , ajouterUtilisateurController.ajouter_utilisateur_post);


module.exports = router;