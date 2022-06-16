const { PrismaClient }  = require('@prisma/client');
const prisma = new PrismaClient();


const planification_index = async (req , res) =>{

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
        'sections' : sections,
        'user' : req.user
    });

}

const planification_update = async (req , res) =>{
    return res.render('update_plan',{
        'user' : req.user,
    });
}

const planification_update_section = async (req,res) =>{
   
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
        'flag' : 'update',
        'user' : req.user,
    })
}

const planification_update_module = async (req , res) =>{
      
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
              code_section_code_module_session : {
                  code_section : section.code_section,
                  code_module : my_module.code_module,
                  session : parseInt(req.params.session),
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

    let creneaux_interdits = await prisma.examen.findMany({
        where : {
            code_section : req.params.section_id,
        },
        select: {
            Creneau :{
                select : {
                    code_creneau : true,
                }
            }
        }
    });

    let creneaux_interdits_ids = creneaux_interdits.map(element => element.Creneau.code_creneau);
    
    let autre_creneaux = await prisma.creneau.findMany({
        where : {
            code_creneau : {in : autre_creneau_ids_codes  , notIn : creneaux_interdits_ids }
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
       'user' : req.user,
   })


}

const planification_update_module_post = async (req,res) => {

    

    let exam = await prisma.examen.update({
        where : {
            code_section_code_module_session : {
                code_section : req.params.section_id, 
                code_module : req.params.module_id,   
                session : parseInt(req.params.session),    
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
            code_creneau :  parseInt(req.body.creneau),
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

        console.log('Suiiiiiiiiiiiii Striiiiiiiiiiiiiiiing');
    }
    else{
        console.log('Suiiiiiiiiiiiii Array');
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
            let charge_cours = await prisma.chargeCours.findUnique({
                where : {
                    code_section_code_module : {
                        code_section : req.params.section_id,
                        code_module : req.params.module_id,
                    },
                },
                select : {
                    code_enseignant : true,
                }

           });
           if(charge_cours != null && index == 0){
              
              let surveillance = await prisma.surveillance.create({
                  data : {
                    code_creneau : local_examen.code_creneau,
                    code_module : local_examen.code_module,
                    code_section : local_examen.code_section,
                    code_local : local_examen.code_local,
                    code_enseignant : charge_cours.code_enseignant,
                  }
              });
           }
        }
  }

    res.json(
        {
        'dest' :
        `/planification/update/${req.params.semestre}/${req.params.session}/${req.params.section_id}`
        });
}

const planification_section = async (req , res) =>{

    
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
        'flag' : 'planifier',
        'user' : req.user,
    });

     

}
const planification_module = async (req , res) => {

    

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
       'creneaux' : creneaux,
       'user' : req.user,
   })

}
const planification_module_post = async (req , res) =>{

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

        console.log('Grrrrrrrrrr Striiiiiiing');
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

           let charge_cours = await prisma.chargeCours.findUnique({
                where : {
                    code_section_code_module : {
                        code_section : req.params.section_id,
                        code_module : req.params.module_id,
                    },
                },
                select : {
                    code_enseignant : true,
                }

           });
           console.log(charge_cours);
           if(charge_cours != null && index == 0){

              let already_in = await prisma.surveillance.findUnique({
                where : {
                    code_creneau_code_enseignant : {
                        code_enseignant : charge_cours.code_enseignant,
                        code_creneau : local_examen.code_creneau
                    }
                }
              });
              if(! already_in){
                let surveillance = await prisma.surveillance.create({
                    data : {
                      code_creneau : local_examen.code_creneau,
                      code_module : local_examen.code_module,
                      code_section : local_examen.code_section,
                      code_local : local_examen.code_local,
                      code_enseignant : charge_cours.code_enseignant,
                    }
                });
              }
           }

            
        }
    }
}
    res.json( 
        {
        'dest' : `/planification/${req.params.semestre}/${req.params.session}/${req.params.section_id}`
       }
    );



}

const planification_pre_consultation = async (req , res) =>{

    res.render('consulter',{
        'user' : req.user,
    });
    
}

const planification_consultation = async(req , res) => {

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
                },
                
            },
            Section : {
                select : {
                    anneeEtude : true,
                    code_specialite : true,
                    nom_section : true,
                }
            }
        },
        orderBy: [
            {
             Creneau : {
                date : 'asc'
             }
            },
            {
              Creneau :{
                start_time : 'asc'
              }
            },
          ],
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
    
    let departement = await prisma.section.findUnique({
        where : {
            code_section : req.params.section_id
        },
        select: {
            Specialite :{
                select :
                {
                    code_departement : true
                }
            }
        }
    });
    let flag = departement.Specialite.code_departement == req.user.type;
    return res.render('consulter_planning' , {
        'exams' : exams,
        'niveau' : niveau,
        'section' : section,
        'semestre' : req.params.semestre,
        'session' : req.params.session,
        'user' : req.user,
        'flag' : flag,
    });
}

module.exports = {
    planification_index,
    planification_update,
    planification_update_section,
    planification_update_module,
    planification_update_module_post,
    planification_section,
    planification_module,
    planification_module_post,
    planification_pre_consultation,
    planification_consultation,
}

