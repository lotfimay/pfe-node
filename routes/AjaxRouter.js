const express = require('express');
const { PrismaClient }  = require('@prisma/client');
const prisma = new PrismaClient();

const router = express.Router();

router.get('/locaux_disponibles' , async (req , res)  => {
    
    let reservations_disponible = await prisma.reservation.findMany({
      select : {
          code_local : true,
      },
      where : {
          code_creneau : parseInt(req.query.code_creneau),
          disponible : true,
      },
      
    });
    let locaux_ids = reservations_disponible.map(element => element.code_local);
    
    let locaux = await prisma.reservation.findMany({
        where : {
            code_local : {in : locaux_ids}
        },
        distinct : ['code_local']
    });
    return res.render('chained_drop_downs/locaux.ejs' , {
        'locaux' : locaux
    })
});


router.get('/update_planification' , async (req , res) =>{
   
    let creneau = parseInt(req.query.code_creneau);
    let section = req.query.section;
    let my_module = req.query.module;

    console.log(creneau);
    console.log(section);
    console.log(my_module);

    let exists = await prisma.examen.findUnique({
        where : {
            code_module_code_section_code_creneau : {
                code_creneau  : creneau,
                code_section : section,
                code_module : my_module,
            }
        }
    });
    
    if(exists){
        let code_locaux = await prisma.localExamen.findMany({
            where : {
                code_creneau  : creneau,
                code_section : section,
                code_module : my_module,
            },
            select : {
                code_local : true
            }
        });
        let locaux_ids = code_locaux.map(element => element.code_local);
        
        let locaux_existent = await prisma.local.findMany({
            where : {
                code_local : {in : locaux_ids}
            }
        });
        let autre_locaux_code = await prisma.reservation.findMany({
            where : {
               code_creneau : creneau,
               disponible : true,
            },
            select : {
                code_local : true,
            }
        });
        let autre_locaux_ids = autre_locaux_code.map(element => element.code_local);
       
        let autre_locaux = await prisma.local.findMany({
            where : {
                code_local : { in : autre_locaux_ids , notIn : locaux_ids}
            },
            distinct : ['code_local']
        });
        return res.render('chained_drop_downs/locaux_update', {
            'locaux_existent' : locaux_existent,
            'autre_locaux' : autre_locaux,
        });
    }
    else{
        let code_locaux = await prisma.localExamen.findMany({
            where : {
                code_section : section,
                code_module : my_module,
            },
            select : {
                code_local : true
            }
         });
        let locaux_ids = code_locaux.map(element => element.code_local);
        
        let locaux_existent = await prisma.local.findMany({
            where : {
                code_local : {in : locaux_ids}
            }
        });

        let final_locaux_existent = [];
        
        for(let index in locaux_existent){
            let flag = await prisma.reservation.findUnique({
                where : {
                    code_creneau_code_local : {
                        code_creneau : creneau,
                        code_local :locaux_existent[index].code_local,
                    },
                },
            });
            if(flag){
                if(flag.disponible == true){
                    final_locaux_existent.push(locaux_existent[index]);
                }
            }
        }
        let final_locaux_existent_ids = final_locaux_existent.map(element => element.code_local);

        let autre_locaux_code = await prisma.reservation.findMany({
            where : {
               code_creneau : creneau,
               disponible : true,
            },
            select : {
                code_local : true,
            }
        });
        let autre_locaux_ids = autre_locaux_code.map(element => element.code_local);
       
        let autre_locaux = await prisma.local.findMany({
            where : {
                code_local : { in : autre_locaux_ids , notIn : final_locaux_existent_ids}
            },
            distinct : ['code_local']
        });

        return res.render('chained_drop_downs/locaux_update', {
            'locaux_existent' : final_locaux_existent,
            'autre_locaux' : autre_locaux,
        });
       
    }


});

router.get('/specialites_par__palier', async (req , res) =>{

    let arr = [];
    if(req.user.type == 'IA'){
       arr.push('IA');
    }
    if(req.user.type == 'SI'){
        arr.push('SI');
    }
    if(req.user.type == 'VD' || req.user.type == 'SC' || req.user.type == 'ENS'){
        arr.push('IA');
        arr.push('SI');
    }
  
  let specialites = await prisma.specialite.findMany({
      where : {
          palier : req.query.palier,
          code_departement : {in : arr},
      }
  });
  
  return res.render('chained_drop_downs/specialites.ejs' , {
      'specialites' : specialites
  })
});

router.get('/sections_par_niveau' , async (req , res) =>{

    console.log(req.query.code_specialite);
    console.log(req.query.niveau);


    let sections = await prisma.section.findMany({
        where : {
            code_specialite : req.query.code_specialite,
            anneeEtude : parseInt(req.query.niveau)
        }
    });

    console.log(sections);

    return res.render('chained_drop_downs/sections' , {
        'sections' : sections
    });
});

router.get('/modules__par__section' , async (req , res) => {

    console.log(req.query.code_section);
    console.log(req.query.semestre);
    console.log(req.query.session);
      
     let modules = await prisma.examen.findMany({
        where : {
            code_section : req.query.code_section,
            semestre : parseInt(req.query.semestre),
            session : parseInt(req.query.session),
        }
        , 
        select : {
             Module : {
                 select :  {
                     code_module : true,
                     nom_module : true,
                 }
             },
             Creneau : {
                 select :{
                     date : true,
                     start_time : true,
                     end_time : true,
                 }
             },
             LocalExamen : {
                 select : {
                     Local : {
                         select : {
                             code_local : true,
                         }
                     }
                 }
             }
         }
     });

     return res.render('chained_drop_downs/modules' , {
         'modules' : modules
     });
      


});

router.delete('/examen' ,async (req , res) =>{


    console.log(req.body);
   
    try{
       let deleted_examen = await prisma.examen.deleteMany({
           where : {
               code_section : req.body.section,
               code_module : req.body.module,
               session : parseInt(req.body.session),
           }
       })

        return res.json({
            'message' : 'deleted successfully !'
        })
    }
    catch(err){
        console.log(err);
        res.status(500).json({
            'message' : 'something went wrong !'
        })
    }

});
router.delete('/enseignant' , async (req , res) =>{

     try{
         let deleted_enseignant = await prisma.enseignant.delete({
             where : {
                 code_enseignant : parseInt(req.body.code)
             }
         });
         return res.json({'message' : 'deleted successfully'})
     }catch(err){
         return res.status(500).json({'message' : 'Something went wrong !'})
     }
});

router.get('/verify_convocation' , async(req ,res) =>{
   
   console.log(req.query);

   try{
    let exists = await prisma.surveillance.findFirst({
        where : {
            code_enseignant : parseInt(req.query.code_enseignant),
            LocalExamen : {
            Examen:{
                semestre : parseInt(req.query.semestre),
                session : parseInt(req.query.session),
            }
        }
        }
    });

    if(exists != null){
        return res.json({'data' : true});
    }
    else res.json({'data' : false});

   }catch(err){

        res.status(500).json({'message' : 'Something went wrong !'});
   }

});

router.get('/email__enseignant' , async(req , res) =>{

  try{
    let enseignant = await prisma.enseignant.findUnique({
        where :{
            email : req.query.email,
        }
    });
    console.log(enseignant);
    return res.json({'code_enseignant' : enseignant.code_enseignant.toString()})
  }catch(error){
    console.log(error);
    return res.status(500).json({'error' : 'Something went wrong !'})
  }


});

router.get('/pv__modules' , async(req , res) =>{


    let tmp_modules = await prisma.chargeCours.findMany({
        where : {
            code_enseignant : parseInt(req.query.code_enseignant),
        },
        select :{
            Module : true,
        }
    });
    let modules_ids = tmp_modules.map(element => element.Module.code_module);
    console.log(modules_ids);
    let modules = await prisma.examen.findMany({
        where : {
            code_section : req.query.section,
            session : parseInt(req.query.session),   
            code_module : {in : modules_ids}         
        },
        select : {
            Module : true,
        }
    });
    console.log('Here');
    console.log(modules);
    return res.render('chained_drop_downs/modules' , {
        'modules' : modules,
    })

});

module.exports = router;