const readExcelFile = require('../utils/excelHelper');
const multer = require('multer');
const fs = require('fs');


var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, __dirname + '/../uploads/')
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname + '-' + Date.now() + '.xlsx')
    }
});
var upload = multer({
    storage: storage
});

const file_upload_index = async (req , res) =>{
    res.render('upload_file');
}

const file_upload_index_post = async (req , res) =>{

    await readExcelFile(__dirname + '/../uploads/' + req.file.filename);
    fs.unlink(__dirname + '/../uploads/' + req.file.filename , (err) =>{
        if(err){
            console.log(err);
        }
        console.log('File deleted successfully');
    });
 
    res.redirect('/');
 }

module.exports = {
    file_upload_index,
    file_upload_index_post,
    upload
}