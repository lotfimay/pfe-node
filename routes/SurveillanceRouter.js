const express = require('express');
const { PrismaClient }  = require('@prisma/client');
const prisma = new PrismaClient();

const router = express.Router();




router.get('' , (req , res) => {
    return res.render('surveillance');
});

router.get('/:semestre_id/:session_id/:section_id/:module_id' , async (req , res) =>{

    let locaux = await prisma.localExamen.findMany({
        where : {
            code_section : req.params.section_id,
            code_module : req.params.module_id,
        },
        select : {
            Local : {
                select : {
                    code_local : true,
                    capacite : true,
                }
            }
        }
    });
    return res.render('locaux' , {
        'locaux' : locaux,
        'semestre' : req.params.semestre_id,
        'session' : req.params.session_id,
        'section' : req.params.section_id,
        'module' : req.params.module_id,
    });


});

router.get('/:semestre_id/:session_id/:section_id/:module_id/:local_id' , async (req , res)=>{

    let my_module = await prisma.module.findUnique({
        where : {
            code_module : req.params.module_id,
        }
    });
    let creneau = await prisma.examen.findUnique({
        where : {
            code_section_code_module : {
                code_module : req.params.module_id,
                code_section : req.params.section_id,
            }
        },
        select : {
            Creneau : {
                select : {
                    code_creneau : true,
                    date : true,
                    start_time : true,
                    end_time : true,
                }
            }
        }
    });

    let local = await prisma.local.findUnique({
        where : {
            code_local : req.params.local_id,
        }
    });
    
    let enseignant_interdits = await prisma.surveillance.findMany({
        select : {
            code_enseignant : true,
        },
        where : {
            code_creneau : creneau.Creneau.code_creneau,
        }
    });
    
    let enseignant_deja_selectionner = await prisma.surveillance.findMany({
        where : {
            code_creneau : creneau.Creneau.code_creneau,
            code_section : req.params.section_id,
            code_local : req.params.local_id,
        },
        select : {
            Enseignant : {
                select : {
                    code_enseignant : true,
                    nom_enseignant : true,
                    prenom_enseignant : true,
                    code_grade : true,
                }
            }
        }
    });


    for(let index in enseignant_deja_selectionner){

        let nb = await prisma.surveillance.aggregate({
            _count : {
                  code_enseignant : true,
            },
            where : {
                code_enseignant : enseignant_deja_selectionner[index].Enseignant.code_enseignant,
                LocalExamen : {
                    Examen : {
                        semestre : parseInt(req.params.semestre_id),
                        session : parseInt(req.params.session_id),
                    }
                }
            }
        });
        let grade = await prisma.grade.findUnique({
            where : {
                code_grade : enseignant_deja_selectionner[index].Enseignant.code_grade,
            }
        });

        nb._count.code_enseignant = grade.nombre_surveillances - nb._count.code_enseignant;
        enseignant_deja_selectionner[index].nb  = nb._count.code_enseignant;

    }

    let enseignant_interdits_ids = enseignant_interdits.map(element => element.code_enseignant);

    let enseignants = await prisma.enseignant.findMany({
        where : {
            code_enseignant : {notIn : enseignant_interdits_ids}
        }
    });
    
    for(let index in enseignants){
        let nb = await prisma.surveillance.aggregate({
            _count : {
                  code_enseignant : true,
            },
            where : {
                code_enseignant : enseignants[index].code_enseignant,
            }
        });
        let grade = await prisma.grade.findUnique({
            where : {
                code_grade : enseignants[index].code_grade,
            }
        });
        nb._count.code_enseignant = grade.nombre_surveillances - nb._count.code_enseignant;
        enseignants[index].nb  = nb._count.code_enseignant;
    }
  

  return res.render('affecter_surveillants' ,{
      'module' : my_module,
      'creneau' : creneau,
      'local' : local,
      'enseignants' : enseignants,
      'enseignants_existent' : enseignant_deja_selectionner
  });
});

router.post('/:semestre_id/:session_id/:section_id/:module_id/:local_id' , async (req , res) =>{
   

   let deleted_surveillances = await prisma.surveillance.deleteMany({
       where : {
           code_creneau : parseInt(req.body.creneau),
           code_local : req.params.local_id,
       }
   });

   if(typeof(req.body.surveillant) == 'string'){
   
    let surveillance = await prisma.surveillance.create({
        data : {
           code_creneau : parseInt(req.body.creneau),
           code_enseignant : parseInt(req.body.surveillant),
           code_local : req.params.local_id,
           code_module : req.params.module_id,
           code_section : req.params.section_id,
       }
    });

   }
   else{
    for(let index in req.body.surveillant){
       let surveillance = await prisma.surveillance.create({
             data : {
                code_creneau : parseInt(req.body.creneau),
                code_enseignant : parseInt(req.body.surveillant[index]),
                code_local : req.params.local_id,
                code_module : req.params.module_id,
                code_section : req.params.section_id,
            }
       });
    }
    }  

    res.redirect(`/surveillance/${req.params.semestre_id}/${req.params.session_id}/${req.params.section_id}/${req.params.module_id}`);
    
});


module.exports = router;