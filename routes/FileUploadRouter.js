const express = require('express');


const router = express.Router();


const fileUploadController = require("../controllers/FileUploadController");








router.get('/' , fileUploadController.file_upload_index);

router.post('/' , fileUploadController.upload.single('file'), fileUploadController.file_upload_index_post);

module.exports = router;