
const express = require('express');

const morgan = require('morgan');


const app = express();
const { PrismaClient }  = require('@prisma/client');
const prisma = new PrismaClient();

const planificationRouter = require('./routes/PlanificationRouter');
const surveillanceRouter = require('./routes/SurveillanceRouter');
const ajaxRouter = require('./routes/AjaxRouter');
const enseignantRouter = require('./routes/EnseignantRouter');
const pdfRouter = require('./routes/PdfRouter');
const uploadRouter = require('./routes/FileUploadRouter');
const espaceEnseignantRouter = require('./routes/EspaceEnseignantRouter');






const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const initializePassport = require("./passportConfig");

const bcrypt = require('bcrypt');










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



app.use('/ajax' ,  checkNotAuthenticated,  ajaxRouter)



app.get('/' ,checkNotAuthenticated ,async (req , res) =>{
     
   
    if(req.user.type == 'ENS'){
       return res.redirect('/espace-enseignant')
    }

    return res.render('main',{
        'user' : req.user,
    });  
});

app.use('/espace-enseignant' , checkNotAuthenticated  , async (req , res , next) =>{
 
    if(req.user.type != 'ENS'){
      return res.redirect('/')
    }
    else return next();

},espaceEnseignantRouter);




app.get('/consulter' , checkNotAuthenticated ,async (req , res) =>{

    res.render('consulter',{
        'user' : req.user,
    });
    
});

app.get('/consulter-surveillance' , async (req , res) =>{

    return res.render('consulter_surveillance',
    {
        'user' : req.user,
    });

});


app.get('/consulter/:semestre/:session/:section_id' ,checkNotAuthenticated ,async (req , res , next) =>{
   if(req.user.type != 'ENS' && req.user.type != 'VD' && req.user.type != 'IA' && req.user.type != 'SI'){
     return res.redirect('/');
   }
   else return next();
},async(req , res , next) =>{
    if(req.user.type != 'ENS' && req.user.type != 'VD'){
        let departement = await prisma.section.findUnique({
            where : {
                code_section  : req.params.section_id,
            },
            select : {
                Specialite : {
                    select : {
                        Departement : {
                            select : {
                                code_departement : true,
                            }
                        }
                    }
                }
            }
        });
        if(departement.Specialite.Departement.code_departement != req.user.type){
            return res.redirect('/');
        }
        else return next();
    }
    else return next();
} , async(req , res) => {

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



app.get('/ajouter-utilisateur' , checkNotAuthenticated , async(req , res , next)=>{
    if(req.user.type != 'SP'){
        return res.redirect('/');
    }
    else return next()
},async (req , res) =>{

    const departements = await prisma.departement.findMany();
    

    res.render('ajouter_utilisateur' , {
        'departements' : departements,
        'message' : '',
        'user' : req.user
    });

});

app.post('/ajouter-utilisateur' , checkNotAuthenticated,async(req , res , next)=>{
    if(req.user.type != 'SP'){
        return res.redirect('/');
    }
    else return next()
},async (req , res ,) =>{

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




app.use('/upload-file' , checkNotAuthenticated,async(req , res , next) =>{
    if(req.user.type != 'VD'){
      return res.redirect('/');
    }
    else return next();
},uploadRouter);






app.get('/logout', (req, res , next) => {
    req.logout((err) =>{
        if(err){
            return next(err); 
        }
        res.redirect('/login');
    });

});








// ------------------- start planification --------------------------
app.use('/planifier'  ,checkNotAuthenticated , async(req , res , next) =>{
    if(req.user.type != 'IA' && req.user.type != 'SI'){
         return res.redirect('/')
    }
    else next();
}  ,planificationRouter)
// ---------------- end planification -----------------------------------

app.use('/pdf' , checkNotAuthenticated ,pdfRouter);



























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













