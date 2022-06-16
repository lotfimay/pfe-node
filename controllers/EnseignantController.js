const { PrismaClient }  = require('@prisma/client');
const prisma = new PrismaClient();

const bcrypt = require('bcrypt');

const enseignant_index = async (req , res) =>{


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
        'flag' : false,
    });

}
const enseignant_convocation = async (req , res) =>{

    

    res.render('generer_convocations' ,{
        'user' : req.user,
        'code_enseignant' : null,
    });


}
const enseignant_convocation_semestre_session = async (req , res) =>{

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
        'flag' : true,
    })

}
const enseignant_ajouter_enseignant = async (req , res) =>{
   
    res.render('ajouter_enseignant' , {
        'user' : req.user,
    })
}
const enseignant_ajouter_enseignant_post = async (req , res) =>{
    console.log(req.body);

    try{
        const new_enseignant = await prisma.enseignant.create({
            data : {
                nom_enseignant : req.body.nom.toUpperCase(),
                prenom_enseignant : req.body.prenom.toUpperCase(),
                email : req.body.email,
                code_grade : req.body.grade,

            }
        });
        let enc_password = await bcrypt.hash(req.body.nom.toLowerCase() + '_' + req.body.prenom.toLowerCase() , 10)
        const new_user = await prisma.users.create({
            data : {
                user_name : req.body.nom.toLowerCase() + '_' + req.body.prenom.toLowerCase(),
                email : req.body.email,
                type : 'ENS',
                password : enc_password,
            }
        });

    }catch(err){
        console.log(err);
    }
    res.redirect('/enseignants/')
}
const enseignant_profile = async(req , res) =>{
    
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

}
const enseignant_profile_post = async (req , res) =>{

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
}
const enseignant_profile_delete = async (req , res) =>{
  
    const deleted_user = await prisma.enseignant.delete({
        where : {
            code_enseignant : parseInt(req.params.enseignant_id)
        }
    });
    
    res.redirect('/enseignants/');

}

module.exports = {
    enseignant_index,
    enseignant_convocation,
    enseignant_convocation_semestre_session,
    enseignant_ajouter_enseignant,
    enseignant_ajouter_enseignant_post,
    enseignant_profile,
    enseignant_profile_post,
    enseignant_profile_delete,

}