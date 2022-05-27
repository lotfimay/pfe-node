const express = require('express');
const { PrismaClient }  = require('@prisma/client');
const prisma = new PrismaClient();

const router = express.Router();


router.get('/' , async (req , res) =>{

    console.log(req.user);

    let master_specialites = await prisma.specialite.findMany({
        where : {
            palier : 'MASTER'
        },
    });



    let licence_specialites = await prisma.specialite.findMany({
        where : {
            palier : 'LICENCE'
        },
    });
    
    
    let sections = await prisma.section.findMany();
    
    return res.render('planifier' , {
        'licence' : licence_specialites,
        'master' : master_specialites,
        'sections' : sections
    });

});

router.get('/update' , (req , res) =>{
    return res.render('update_plan');
});

router.get('/update/:semestre/:session/:section_id/' , async (req,res) =>{
   
    let modules  = await prisma.examen.findMany({
        where : {
            code_section : req.params.section_id,
            semestre : parseInt(req.params.semestre),
            session : parseInt(req.params.session),
        },
        select : {
            Module : {
                select : {
                    code_module : true,
                    nom_module : true,
                }
            }
        }
    });
    
    return res.render('modules' ,{
        'modules': modules,
        'semestre' : req.params.semestre,
        'session' : req.params.session,
        'section' : req.params.section_id,
        'flag' : 'update'
    })
});


router.get('/update/:semestre/:session/:section_id/:module_id' , async (req , res) =>{
      
    let section = await prisma.section.findUnique({
        where : {
            code_section : req.params.section_id,
        },
    });
    console.log(section.code_section);

    let my_module = await prisma.module.findUnique({
        where : {
          code_module : req.params.module_id
        },

    });

    console.log(my_module.code_module);

    // récuperer le creneau deja sélectionner


    let code_creneau = await prisma.examen.findUnique({
         where : {
              code_section_code_module : {
                  code_section : section.code_section,
                  code_module : my_module.code_module,
              }
         },
    });
    
    console.log(section);
    console.log(my_module);


    console.log(code_creneau);
    
    let creneau = await prisma.creneau.findUnique({
        where : {
            code_creneau : code_creneau.code_creneau,
        },
        
    });

    // récuperer les autres créneaux
    
    let autre_creneau_ids = await prisma.reservation.findMany({
        where : {
           disponible  : true,
        },
        select:{
            code_creneau : true
        }
    });
    
    let autre_creneau_ids_codes  = autre_creneau_ids.map(element => element.code_creneau);
    
    let autre_creneaux = await prisma.creneau.findMany({
        where : {
            code_creneau : {in : autre_creneau_ids_codes  , notIn : code_creneau.code_creneau }
        }
    });

    // récuperer lex  locaux deja séléctionner 

    let code_locaux = await prisma.localExamen.findMany({
        where : {
            code_creneau : code_creneau.code_creneau,
            code_module : module.code_module,
            code_section : section.code_section
        },
        select : {
           code_local : true 
        },
        distinct : ['code_local']
    });
    let locaux_ids = code_locaux.map(element => element.code_local);

    let locaux = await prisma.local.findMany({
        where : {
            code_local : {in  :  locaux_ids}
        },  
    });

    // récuperer les autre locaux

    let autre_locaux_code = await prisma.reservation.findMany({
        where : {
           code_creneau : code_creneau.code_creneau,
           disponible : true,
        },
        select : {
            code_local : true,
        }
    });
    
    let autre_locaux_ids = autre_locaux_code.map(element => element.code_local);

    let autre_locaux = await prisma.local.findMany({
         where : {
             code_local : {in : autre_locaux_ids}
         }
    });

   return res.render('update_module_plan' , {
       'section' : section,
       'module' : my_module,
       'creneau' : creneau,
       'locaux' : locaux,
       'creneaux' : autre_creneaux,
       'autrelocaux' : autre_locaux,
   })


});

router.post('/update/:semestre/:session/:section_id/:module_id' , async (req,res) => {

    console.log(req.body);

    let exam = await prisma.examen.update({
        where : {
            code_section_code_module : {
                code_section : req.params.section_id, 
                code_module : req.params.module_id,       
            },
        },
        data : {
            code_creneau : parseInt(req.body.creneau)
        }
    });
    

    let deleted_exams = await prisma.localExamen.deleteMany({
        where : {
            code_module : req.params.module_id,
            code_section : req.params.section_id,
            code_creneau :  parseInt(req.body.creneau)  
        }
    });
    let locaux = req.body.local;
    
    if(typeof(req.body.local) == 'string'){
        
        let local = await prisma.local.findUnique({
            where : {
                code_local : locaux
            }
        });
        let local_examen = await prisma.localExamen.create({
            data : {
                code_creneau : exam.code_creneau,
                code_module : exam.code_module,
                code_section : exam.code_section,
                code_local : locaux,

            }
        });
    }
    else{
        for(let index in locaux){
            let local = await prisma.local.findUnique({
                where : {
                    code_local : locaux[index]
                }
            });
            let local_examen = await prisma.localExamen.create({
            data : {
                code_creneau : exam.code_creneau,
                code_module : exam.code_module,
                code_section : exam.code_section,
                code_local : local.code_local,

            }
        });
    }
  }

    res.redirect(`/planifier/update/${req.params.semestre}/${req.params.session}/${req.params.section_id}`);
});

router.get('/:semestre/:session/:section_id' , async (req , res) =>{

    
      let section = await prisma.section.findUnique({
          where : {
              code_section : req.params.section_id
          }
       });

      let modules_ids = await prisma.moduleSpecialite.findMany({
          where : {
             code_specialite : section.code_specialite,
             anneeEtude : section.anneeEtude,
             semestre : parseInt(req.params.semestre),
          },
          select : {
            code_module : true,
         }
      });
      let ids = modules_ids.map(a => a.code_module);


      let modules_deja_planifier = await prisma.examen.findMany({
         
        where : {
            code_section : section.code_section,
            semestre : parseInt(req.params.semestre),
            session : parseInt(req.params.session),  
        }
        , 
      });

      

      

      let modules_planifier_ids = modules_deja_planifier.map(a => a.code_module)

      let modules_plan = await prisma.module.findMany({
          where : {
              code_module : {in : modules_planifier_ids}
          }
      });
     
      let modules = await prisma.module.findMany({
         where : {
             code_module : { in : ids , notIn : modules_planifier_ids },
         }

      });

      return res.render('modules' , {
          'modules' : modules,
          'modules_planifiees' : modules_plan,
          'semestre' : req.params.semestre,
          'session' : req.params.session,
          'section' : req.params.section_id,
          'flag' : 'planifier'
      });

       

});


router.get('/:semestre/:session/:section_id/:module_id' , async (req , res) => {

    

    let section = await prisma.section.findUnique({
        where : {
            code_section : req.params.section_id
        }
    });

    let module = await prisma.module.findUnique({
        where : {
            code_module : req.params.module_id
        }
    });

    // verfier si le module est deja planifie encore une fois -- later

    // let verify = await prisma.examen.findMany({
    //     where : {
    //        code_section : req.params.section_id,
    //        code_module : req.params.module_id,
    //     }
    // });

    // console.log(verify);

    // if(verify){
    //     res.redirect(`/planifier/${req.params.semestre}/${req.params.section_id}/${req.params.module_id}/update`);
    // }

    
    // les creneaux where les salles disponibles:


    let creneaux_disponible = await prisma.reservation.findMany({
        select : {
            code_creneau : true
        },
        where : {
           disponible : true,
        },
        distinct : ['code_creneau']
    });

    console.log("creneaux disponibles: " , creneaux_disponible);

    let ids_disponibles = creneaux_disponible.map(element => element.code_creneau);


    // les creneaux interdits:

    let creneaux_interdits = await prisma.examen.findMany({

        select : {
           code_creneau : true
        },
        where : {
            code_section : section.code_section
        },
    });

    console.log("creneaux interdits: " ,  creneaux_interdits);


    let ids_interdits = creneaux_interdits.map(element => element.code_creneau);
    

    let creneaux = await prisma.creneau.findMany({
        where : {
           code_creneau : { in : ids_disponibles , notIn : ids_interdits}
        }
    });

   return res.render('planifier_module' , {
       'module' : module,
        'creneaux' : creneaux
   })

});

router.post('/:semestre/:session/:section_id/:module_id' , async (req , res) =>{

    console.log(req.body);

    let section = await prisma.section.findUnique({
        where : {
            code_section : req.params.section_id
        }
    });

    let module = await prisma.module.findUnique({
        where : {
            code_module : req.params.module_id
        }
    });

    let exam = await prisma.examen.create({
        data : {
            code_creneau : parseInt(req.body.creneau),
            code_module : module.code_module,
            code_section : section.code_section,
            semestre : parseInt(req.params.semestre),
            session : parseInt(req.params.session),
        }
    })

    let locaux = req.body.local;

    if(typeof(req.body.local) == 'string'){
        
        let local = await prisma.local.findUnique({
            where : {
                code_local : locaux
            }
        });
        let local_examen = await prisma.localExamen.create({
            data : {
                code_creneau : exam.code_creneau,
                code_module : exam.code_module,
                code_section : exam.code_section,
                code_local : locaux,

            }
        });
    }

    // to add later : ajouter le responsable du module autamaticement as a surveillant
    else{

    
    for(let index in locaux){

       let local_disponible = await prisma.reservation.findUnique({
           select : {
             disponible : true,
           },
           where : {
            code_creneau_code_local : {
                code_creneau : parseInt(req.body.creneau),
                code_local : locaux[index],
            }
           }
       });


       if (local_disponible){

            let my_local = await prisma.local.findUnique({
                where : {
                    code_local : locaux[index]
                }
            });

           let local_examen = await prisma.localExamen.create({
               data : {
                  code_creneau : exam.code_creneau,
                  code_module  : exam.code_module,
                  code_section : exam.code_section, 
                  code_local : my_local.code_local ,
               },
           });

            // to add later ajouter le charge de cours comme surveillant automaticement

            
        }
    }
}
    res.redirect(`/planifier/${req.params.semestre}/${req.params.session}/${req.params.section_id}`);



});

module.exports = router;