
const express = require('express');
const fs = require('fs');
const morgan = require('morgan');

const app = express();
const { PrismaClient }  = require('@prisma/client');
const prisma = new PrismaClient();

const planificationRouter = require('./routes/PlanificationRouter');
const surveillanceRouter = require('./routes/SurveillanceRouter');
const ajaxRouter = require('./routes/AjaxRouter');
const enseignantRouter = require('./routes/EnseignantRouter');


const pdfService = require('./services/pdf-service');
const pdfService2 = require('./services/pdf-pvexamen');
const pdfService3 = require('./services/pdf-emploi');

const readExcelFile = require('./utils/excelHelper');


const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const initializePassport = require("./passportConfig");

const bcrypt = require('bcrypt');
const multer = require('multer');
const nodemailer = require('nodemailer');

var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, __dirname + '/uploads/')
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname + '-' + Date.now() + '.xlsx')
    }
});
var upload = multer({
    storage: storage
});








app.use(express.static('public'));
app.use(express.urlencoded({extended : true}));
app.use(morgan('dev'));
app.use(express.json());
app.set('view engine' , 'ejs');

initializePassport(passport);


app.use(
    session({
      // Key we want to keep secret which will encrypt all of our information
      secret: process.env.SESSION_SECRET,
      // Should we resave our session variables if nothing has changes which we dont
      resave: false,
      // Save empty value if there is no vaue which we do not want to do
      saveUninitialized: false
    })
);
app.use(flash());


app.use(passport.initialize());
// Store our variables to be persisted across the whole session. Works with app.use(Session) above
app.use(passport.session());





app.use('/surveillance' ,checkNotAuthenticated,surveillanceRouter)



app.use('/ajax' , ajaxRouter)



app.get('/' ,checkNotAuthenticated ,async (req , res) =>{
    console.log(req.user);
    return res.render('main',{
        'user' : req.user,
    });  
});




app.get('/consulter' , checkNotAuthenticated ,async (req , res) =>{

    if(req.user.type == 'VD'){
        return res.render('consulter_surveillance');
    }
    res.render('consulter',{
        'user' : req.user,
    });
    
});

app.get('/consulter/:semestre/:session' , async (req , res) =>{

    let result = await prisma.surveillance.findMany({
        where : {
            LocalExamen  : {
               Examen : {
                   semestre : parseInt(req.params.semestre),
                   session : parseInt(req.params.session),
               }
            }
        },
        select : {
            Enseignant : true,
            LocalExamen : {
                select : {
                    Local : {
                        select : {
                            code_local : true,
                        }
                    },
                    Examen : {
                        select : {
                            code_module : true,
                            Creneau : {
                                select : {
                                    date : true,
                                    start_time : true,
                                }
                            }
                        }
                    }
                }
            },
            
            
        }
    });
    console.log(result);
   return  res.json('Okkk');
});

app.get('/consulter/:semestre/:session/:section_id' ,checkNotAuthenticated ,async(req , res) => {

    let exams = await prisma.examen.findMany({
        where : {
            code_section : req.params.section_id,
            semestre : parseInt(req.params.semestre),
            session : parseInt(req.params.session),
        },
        select : {
            code_section : true,
            code_module : true,
            code_creneau : true,
            Creneau : {
                select : {
                   date : true,
                   start_time : true,
                   end_time : true,
                }
            },
            Section : {
                select : {
                    anneeEtude : true,
                    code_specialite : true,
                    nom_section : true,
                }
            }
        }
    });

    let section = await prisma.section.findUnique({
        where : {
            code_section : (req.params.section_id),
        }
    });

    /// need to be fixed later
    let niveau = '';
    switch (section.anneeEtude){
            case 2 : niveau = 'L2';break;
            case 3: niveau = 'L3';break;
            case 4: niveau = 'M1';break;
            case 5: niveau = 'M2';break;
    }
    
   
    for(let index in exams){
        let locaux = await prisma.localExamen.findMany({
             
            where : {
                code_creneau : exams[index].code_creneau,
                code_module : exams[index].code_module,
                code_section : exams[index].code_section,
            },
            select : {
               code_local : true,
            }
            
        });
        exams[index].locaux = [];
        for(let i in locaux){
            exams[index].locaux.push(locaux[i].code_local);
        }
    }

    for(let index in exams){
        let result = '';
        for(let j in exams[index].locaux){
         if(j < exams[index].locaux.length - 1)
            result = result + exams[index].locaux[j]+'+'
         else result = result + exams[index].locaux[j];
        }
        exams[index].locaux_presentation = result;
    }
    console.log(exams);
    console.log(req.user);
    return res.render('consulter_planning' , {
        'exams' : exams,
        'niveau' : niveau,
        'section' : section,
        'semestre' : req.params.semestre,
        'session' : req.params.session,
        'user' : req.user,
    });
});



app.get('/ajouter-utilisateur' , checkNotAuthenticated ,async (req , res) =>{

    const departements = await prisma.departement.findMany();
    

    res.render('ajouter_utilisateur' , {
        'departements' : departements,
        'message' : '',
        'user' : req.user
    });

});

app.post('/ajouter-utilisateur' , checkNotAuthenticated,async (req , res ,) =>{

       const departements = await prisma.departement.findMany();
   
       try{
        const hashed_password  = await bcrypt.hash(req.body.password , 10);


        const new_user = await prisma.users.create({
            data : {
                user_name : req.body.username,
                password : hashed_password , 
                email : 'lotfimayouf@gmail.com',
                type : req.body.type,
            }
        });

       }catch(err){
        
        console.log(err);
       }

    
     
    res.render('ajouter_utilisateur' , {
        'message' : 'user created successfully',
        'departements' : departements,
        'user' : req.user,
    });
});

app.get('/login' , checkAuthenticated , async (req , res) =>{
    res.render('sign_in');
});

app.post('/login'  ,passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}));


app.use('/enseignants' , checkNotAuthenticated  ,  enseignantRouter);




app.get('/upload-file' , async (req , res) =>{
     res.render('upload_file');
});

app.post('/upload-file' , upload.single('file'), async (req , res) =>{

    await readExcelFile('./uploads/' + req.file.filename);
    fs.unlink('./uploads/' + req.file.filename , (err) =>{
        if(err){
            console.log(err);
        }
        console.log('File deleted successfully');
    });

    res.redirect('/');
});







app.get('/logout', (req, res , next) => {
    req.logout((err) =>{
        if(err){
            return next(err); 
        }
        res.redirect('/login');
    });
    
});




// ------------------- start planification --------------------------
app.use('/planifier'  ,checkNotAuthenticated,planificationRouter)
// ---------------- end planification -----------------------------------

app.get('/:section_id/:module_id/pvexamen',checkNotAuthenticated ,async (req, res, next) => {
 


    let data = await prisma.examen.findUnique({


        where : {
            code_section_code_module : {
                code_section : req.params.section_id,
                code_module : req.params.module_id,
            }
        },
        select : {
            Creneau : {
                select : {
                    date : true,
                    start_time : true,
                }
            },
            code_module : true,
            session : true,
            semestre : true,
            Section : {
                select : {
                    code_section : true,
                    anneeEtude : true,
                    code_specialite : true,
                    nom_section : true
                }
            }
        }
    });

    let charge_cours = await prisma.chargeCours.findUnique({
        where : {
            code_section_code_module : {
                code_section : req.params.section_id,
                code_module : req.params.module_id,
            }
        },
        select  : {
            Enseignant : {
                select : {
                    nom_enseignant : true,
                    prenom_enseignant : true,
                }
            }
        }
    });

    let locaux = await prisma.localExamen.findMany({
        where : {
            code_module : req.params.module_id,
            code_section : req.params.section_id,
        },
        select : {
            Local : {
                select : {
                    code_local : true,
                }
            }
        }
    });
    
    console.log(data);
    let locaux_presentation = '';
    for(let index in locaux){
        if(index < locaux.length - 1){
            locaux_presentation = locaux_presentation + locaux[index].Local.code_local + '+';
        }else{
            locaux_presentation = locaux_presentation + locaux[index].Local.code_local;
        }
    }

    let surveillants__ = await prisma.surveillance.findMany({
        where : {
            code_module : req.params.module_id,
            code_section : req.params.section_id,
        },
        select : {
            Enseignant : {
                select : {
                    nom_enseignant : true,
                    prenom_enseignant : true,
                }
            }
        }
    });

  

    let surveillants = [];
    for(let index in surveillants__){
        surveillants.push(surveillants__[index].Enseignant.nom_enseignant + ' ' + surveillants__[index].Enseignant.prenom_enseignant);
    }

    data.surveillants = surveillants;
    data.locaux = locaux_presentation;
    data.chargeCours = 'Mayouf' + ' ' + 'Lotfi';

    switch(data.Section.anneeEtude){
        case 2:
            data.Section.niveau = 'L2';
            break;
        case 3:
            data.Section.niveau = 'L3';
            break;
        case 4:
            data.Section.niveau = 'M1';
            break;
        case 5:
                data.Section.niveau = 'M2';
                break;
    }

    var dd = String(data.Creneau.date.getDate()).padStart(2, '0');
    var mm = String(data.Creneau.date.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = data.Creneau.date.getFullYear();
    let result = dd + '/' + mm + '/' + yyyy;

    let result_ = (yyyy -1).toString();

    data.annee_universitaire = result_ + ' / ' + yyyy;
    
    data.Creneau.date = result;

    let tmp = data.Creneau.start_time.getHours() - 1 + ':'+ data.Creneau.start_time.getMinutes()+':00';
    
    data.Creneau.start_time = tmp;
    
    console.log(data);
   
    
    const stream = res.writeHead(200, {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment;filename=PV_EXAMEN_${data.code_module}_${data.Section.niveau}_${data.Section.code_specialite}_${data.Section.nom_section}.pdf`,
    });
    pdfService2.PVexamen(
      (chunk) => stream.write(chunk),
      () => stream.end(),
      data
    );
    
});

app.get('/:semestre/:session/:enseignant_id/convocation' , checkNotAuthenticated,async (req , res) => {


    let enseignant = await prisma.enseignant.findUnique({
        where : {
            code_enseignant : parseInt(req.params.enseignant_id)
        }
    });
  

    let surveillances = await prisma.surveillance.findMany({
         
        where : {
            code_enseignant : parseInt(req.params.enseignant_id),
            LocalExamen : {
                Examen : {
                    semestre : parseInt(req.params.semestre),
                    session : parseInt(req.params.session),
                }
            }
        },
        select : {
            code_creneau : true,
            code_module : true,
            code_section : true,
        }
    });

    
    let annee_universitaire = '';
    for(let index in surveillances){
        
        let locaux = await prisma.localExamen.findMany({
            where : {
                code_creneau : surveillances[index].code_creneau,
                code_module : surveillances[index].code_module,
                code_section : surveillances[index].code_section,
            },
            select : {
                code_local : true,
            }
        });

         
        let locaux_presentation = '';

        for(let j in locaux){
            
            if(j == locaux.length - 1){
                locaux_presentation += locaux[j].code_local;
            }
            else locaux_presentation += locaux[j].code_local + '+';
        }

        let creneau = await prisma.creneau.findUnique({
            where : {
                code_creneau : surveillances[index].code_creneau
            }
        });
        
        var dd = String(creneau.date.getDate()).padStart(2, '0');
        var mm = String(creneau.date.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = creneau.date.getFullYear();
        let result = dd + '/' + mm + '/' + yyyy;

        let result_ = (yyyy -1).toString();

        annee_universitaire = result_ + ' / ' + yyyy;
        

        let tmp = creneau.start_time.getHours() - 1 + ':'+ creneau.start_time.getMinutes()+':00';


        surveillances[index].locaux_presentation = locaux_presentation;
        surveillances[index].date = result;
        surveillances[index].start_time = tmp;
        
    }

    let data = new Object();


    

    // if(surveillances.length >= 1){
    //     let semestre_session = await prisma.examen.findUnique({
    //         where : {
    //             code_module_code_section_code_creneau : {
    //                 code_creneau : surveillances[0].code_creneau,
    //                 code_module : surveillances[0].code_module,
    //                 code_section : surveillances[0].code_section,
    //             }
    //         },
    //         select : {
    //             semestre : true,
    //             session : true,
    //         }
    //     });
        
    //     data.semestre = semestre_session.semestre;
    //     data.session = semestre_session.session;
    // }

    
    data.semestre = req.params.semestre;
    data.session = req.params.session;
      
    
    data.surveillances = surveillances;
    data.Enseignant = enseignant;
    data.annee_universitaire = annee_universitaire;

    console.log(data);

    const stream = res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment;filename=CONVOCATION_SURVEILLANCES_${data.Enseignant.nom_enseignant}_${data.Enseignant.prenom_enseignant}.pdf`,
      });
      pdfService.buildPDF(
        (chunk) => stream.write(chunk),
        () => stream.end(),
        data
      );

});

app.get('/:semestre/:session/:section_id/plannings' , async(req , res) =>{
  
    let data = new Object();

    let annee_universitaire = '';
    let exams = await prisma.examen.findMany({
        where : {
            code_section : req.params.section_id,
            semestre : parseInt(req.params.semestre),
            session : parseInt(req.params.session),
        },
        select : {
            code_module : true,
            Creneau : {
                select : {
                    date : true,
                    start_time : true,
                }
            },
            LocalExamen : {
                select :{
                    Local : {
                        select : {
                            code_local : true,
                        }
                    }
                }
            }
        }
    });

    

    let section = await prisma.section.findUnique({
        where : {
            code_section : req.params.section_id,
        }
    });

    switch(section.anneeEtude){
        case 2:
            section.niveau = 'L2';
            break;
        case 3:
            section.niveau = 'L3';
            break;
        case 4:
            section.niveau = 'M1';
            break;
        case 5:
            section.niveau = 'M2';
            break;
    }

    data.section = section;
    data.exams = exams;
    


    for(let index in data.exams){
        let locaux_presentation = '';
        for(j in data.exams[index].LocalExamen){
            if( j < data.exams[index].LocalExamen.length - 1){
                locaux_presentation = locaux_presentation + data.exams[index].LocalExamen[j].Local.code_local + '+';
            }else{
                locaux_presentation = locaux_presentation + data.exams[index].LocalExamen[j].Local.code_local;
            }
        }

        var dd = String(data.exams[index].Creneau.date.getDate()).padStart(2, '0');
        var mm = String(data.exams[index].Creneau.date.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = data.exams[index].Creneau.date.getFullYear();
        annee_universitaire = (yyyy - 1).toString() + '/' + yyyy;
        let result = dd + '/' + mm + '/' + yyyy;
        data.exams[index].Creneau.date = result;
        let tmp = data.exams[index].Creneau.start_time.getHours() - 1 + ':'+ data.exams[index].Creneau.start_time.getMinutes()+':00';
        data.exams[index].Creneau.start_time = tmp;
        data.exams[index].locaux_presentation = locaux_presentation;
        delete exams[index].LocalExamen;
    }

    data.semestre = req.params.semestre;
    data.session = req.params.session;
    data.annee_universitaire = annee_universitaire;


    const stream = res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment;filename=PLANING_EXAMENS_${data.section.niveau}_${data.section.code_specialite}_${data.section.nom_section}.pdf`,
      });

    pdfService3.Emploi(
        (chunk) => stream.write(chunk),
        () => stream.end(),
        data
      );
    
});






function checkUser(req , res ,next){

    if(req.user.type != 'VD' && req.user.type != 'SC' && req.user.type == 'SP'){
        res.redirect('/');
    }
    next();
}



















app.use((req , res) =>{
    res.status(404).json('Page not found');
     
});




function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return res.redirect('/');
    }
    next();
  }
  
function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/login');
  }




app.listen((3000) , ()=>{
      console.log('server running on port 3000 ...');
})





async function inserer_profs(req , res){


    const workbook = xlsx.readFile('profs_2.xlsx');

    let worksheets = {};

    for(const sheetName of workbook.SheetNames){
        worksheets[sheetName] = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName])
    }
    const rows = worksheets.Sheet1;

    for(index in rows){


        try{
            let enseignant = await prisma.enseignant.create({
                data : {
                    nom_enseignant : rows[index].Nom,
                    prenom_enseignant : rows[index].Prenom,
                    email : rows[index].email,
                    code_grade : rows[index].Grade,
                }
            });
        }catch(error){
            console.log(error)
        }

        
        
        
    }


}







