// libraries
const express = require('express');
const morgan = require('morgan');
const { PrismaClient }  = require('@prisma/client');
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const initializePassport = require("./passportConfig");
const bcrypt = require('bcrypt');





// routes
const planificationRouter = require('./routes/PlanificationRouter');
const surveillanceRouter = require('./routes/SurveillanceRouter');
const ajaxRouter = require('./routes/AjaxRouter');
const enseignantRouter = require('./routes/EnseignantRouter');
const pdfRouter = require('./routes/PdfRouter');
const uploadRouter = require('./routes/FileUploadRouter');
const espaceEnseignantRouter = require('./routes/EspaceEnseignantRouter');
const ajouterUtilisateurRouter = require('./routes/AjouterUtilisiteurRouter');





const app = express();
const prisma = new PrismaClient();


// middleware
const globalMiddlewares = require("./middlewares/globalMiddlewares");

















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




app.use('/planification'  ,globalMiddlewares.checkNotAuthenticated  ,globalMiddlewares.check_not_service_p,planificationRouter);



app.use('/surveillance' ,globalMiddlewares.checkNotAuthenticated, globalMiddlewares.check_surveillance_viewer ,surveillanceRouter)



app.use('/ajax' ,  globalMiddlewares.checkNotAuthenticated,  ajaxRouter);



app.use('/enseignants' , globalMiddlewares.checkNotAuthenticated  , globalMiddlewares.check_enseignants_viewer ,enseignantRouter);



app.get('/' ,globalMiddlewares.checkNotAuthenticated, globalMiddlewares.check_not_enseignant , async (req , res) =>{

    let text1;
    let nb1;

    let text2;
    let nb2;

    let text3;
    let nb3;

    let text4;
    let nb4;

    let modules;
    let locaux;
    let enseignants;
    let departements;

    switch(req.user.type){
         
        case 'IA':
            text1 = 'Modules';
            modules = await prisma.moduleSpecialite.findMany({
                where : {
                    Specialite : {
                        Departement : {
                        code_departement : 'IA',
                    }
                    },
                },
                distinct : ['code_module'],
            })
            nb1 = modules.length;
            text2 = 'Salles'
            locaux = await prisma.local.findMany(
                { distinct : ['code_local'] }
            );
            nb2 = locaux.length;
            text3 = 'Surveillants'
            enseignants = await prisma.enseignant.findMany({
                distinct : ['code_enseignant']
            })
            nb3 = enseignants.length;
            text4 = 'Départements';
            departements = await prisma.departement.findMany({
                distinct : ['code_departement']
            });
            nb4 = departements.length;
            break;
        case 'SI':
            text1 = 'Modules';
            modules = await prisma.moduleSpecialite.findMany({
                where : {
                    Specialite : {
                        Departement : {
                        code_departement : 'SI',
                    }
                    },
                },
                distinct : ['code_module'],
            })
            nb1 = modules.length;
            text2 = 'Salles'
            locaux = await prisma.local.findMany(
                { distinct : ['code_local'] }
            );
            nb2 = locaux.length;
            text3 = 'Surveillants'
            enseignants = await prisma.enseignant.findMany({
                distinct : ['code_enseignant']
            })
            nb3 = enseignants.length;
            text4 = 'Départements';
            departements = await prisma.departement.findMany({
                distinct : ['code_departement']
            });
            nb4 = departements.length;
            break
        default :
                text1 = 'Modules';
                modules = await prisma.module.findMany({
                    distinct : ['code_module'],
                })
                nb1 = modules.length;
                text2 = 'Salles'
                locaux = await prisma.local.findMany(
                        { distinct : ['code_local'] }
                );
                nb2 = locaux.length;
                text3 = 'Surveillants'
                enseignants = await prisma.enseignant.findMany({
                        distinct : ['code_enseignant']
                })
                nb3 = enseignants.length;
                text4 = 'Départements';
                departements = await prisma.departement.findMany({
                        distinct : ['code_departement']
                });
                nb4 = departements.length;
                break;
    }

 
       

               
        
 
     
    return res.render('main',{
        'user' : req.user,
        'text1' : text1,
        'text2' : text2,
        'text3' : text3,
        'text4' : text4,
        'nb1' :   nb1,
        'nb2' :   nb2,
        'nb3' :   nb3,
        'nb4' :   nb4,
    });  
});


app.use('/espace-enseignant' , globalMiddlewares.checkNotAuthenticated  ,globalMiddlewares.check_enseignant ,espaceEnseignantRouter);




app.use('/ajouter-utilisateur' , globalMiddlewares.checkNotAuthenticated,globalMiddlewares.check_service_p,ajouterUtilisateurRouter);



app.get('/login' , globalMiddlewares.checkAuthenticated , async (req , res) =>{
    res.render('sign_in');
});

app.post('/login'  ,passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}));


app.use('/enseignants' , globalMiddlewares.checkNotAuthenticated  , globalMiddlewares.check_enseignants_viewer ,enseignantRouter);


app.use('/upload-file' , globalMiddlewares.checkNotAuthenticated,globalMiddlewares.check_vd,uploadRouter);





// move middleware
app.get('/logout', (req, res , next) => {
    req.logout((err) =>{
        if(err){
            return next(err); 
        }
        res.redirect('/login');
    });

});







app.use('/pdf' , globalMiddlewares.checkNotAuthenticated ,pdfRouter);
















app.use((req , res) =>{
    res.status(404).json('Page not found');
     
});







app.listen((3000) , ()=>{
      console.log('server running on port 3000 ...');
})













