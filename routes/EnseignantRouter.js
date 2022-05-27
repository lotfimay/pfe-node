const express = require('express');
const { PrismaClient }  = require('@prisma/client');
const { append } = require('express/lib/response');
const prisma = new PrismaClient();

const router = express.Router();

router.get('/' ,async (req , res) =>{


    let q = req.query.q == undefined ? '' : req.query.q;
   
    const enseignants = await prisma.enseignant.findMany({
        where : {
            OR : [
                {
                    nom_enseignant : {
                        contains : q,
                        mode : 'insensitive'
                    }
                },
                {
                  prenom_enseignant : {
                      contains : q,
                      mode : 'insensitive'
                  }  
                },
                {
                    email : {
                        contains : q,
                        mode : 'insensitive'
                    }
                },
                {
                    code_grade :{
                        contains : q,
                        mode : 'insensitive'
                    }
                }
            ]
        }
    });
    console.log(req.user);
    return res.render('liste_enseignants',{
        'enseignants' : enseignants,
        'user' : req.user,
    });

 });


router.get('/generer-convocations' , async (req , res) =>{

    res.render('generer_convocations');


});


router.get('/generer-convocations/:semestre/:session/' , async (req , res) =>{

    let q = req.query.q == undefined ? '' : req.query.q;

    let surveillants = await prisma.surveillance.findMany({
        select :{
            code_enseignant : true,
            
        },
        where : {
            Enseignant : {
                OR : [
                    {
                        nom_enseignant : {
                            contains : q,
                            mode : 'insensitive'
                        }
                    },
                    {
                      prenom_enseignant : {
                          contains : q,
                          mode : 'insensitive'
                      }  
                    },
                    {
                        email : {
                            contains : q,
                            mode : 'insensitive'
                        }
                    },
                    {
                        code_grade :{
                            contains : q,
                            mode : 'insensitive'
                        }
                    }
                    
                ]
            },
            LocalExamen : {
                Examen : {
                    semestre : parseInt(req.params.semestre),
                    session : parseInt(req.params.session),
                }
            }
            
        }
    });
    let arr = surveillants.map(element => element.code_enseignant);
    let enseignants  = await prisma.enseignant.findMany({
       where : {
           code_enseignant : {in : arr}
       }
    });

    return res.render('liste_enseignants' , {
        'user' : req.user,
        'enseignants' : enseignants,
        'semestre' : req.params.semestre,
        'session' : req.params.session,
    })

});

router.get('/ajouter-enseignant' , async (req , res) =>{
   
    res.render('ajouter_enseignant' , {
        'user' : req.user,
    })
});

router.post('/ajouter-enseignant' , async (req , res) =>{
    console.log(req.body);

    try{
        const new_enseignant = await prisma.enseignant.create({
            data : {
                nom_enseignant : req.body.nom,
                prenom_enseignant : req.body.prenom,
                email : req.body.email,
                code_grade : req.body.grade,

            }
        });

    }catch(err){
        console.log(err);
    }
    res.redirect('/enseignants/')
});

router.get('/:enseignant_id' , async(req , res) =>{
    
    const enseignant = await prisma.enseignant.findUnique({
        where : {
            code_enseignant : parseInt(req.params.enseignant_id),
        }
    });

    let arr = [];
    arr.push(enseignant.code_grade);

    const grades = await prisma.grade.findMany({
        where : {
            code_grade  : { notIn : arr}
        }
    });
    return res.render('enseignant_profile' , {
        'enseignant' : enseignant,
        'autre_grades' : grades,
        'user' : req.user, 
    });

});

router.post('/:enseignant_id' , async (req , res) =>{

    console.log(req.params.enseignant_id);
    
    const update = await prisma.enseignant.update({
        where : {
            code_enseignant : parseInt(req.params.enseignant_id),
        },
        data : {
            nom_enseignant : req.body.nom,
            prenom_enseignant : req.body.prenom,
            email : req.body.emai,
            code_grade : req.params.grade
        }
    })

    return res.redirect('/enseignants/');
});

router.get('/:enseignant_id/delete' , async (req , res) =>{
  
    const deleted_user = await prisma.enseignant.delete({
        where : {
            code_enseignant : parseInt(req.params.enseignant_id)
        }
    });
    
    res.redirect('/enseignants/');

});



module.exports = router;
