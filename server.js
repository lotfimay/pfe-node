const { PrismaClient }  = require('@prisma/client');
const express = require('express');
const fs = require('fs');
const { start } = require('repl');
const morgan = require('morgan');
const xlsx = require('xlsx');
const res = require('express/lib/response');
const app = express();
const prisma = new PrismaClient()
var bodyParser = require('body-parser');





app.use(express.static('public'));
app.use(express.urlencoded({extended : true}));
app.use(morgan('dev'));
app.use(express.json());
app.set('view engine' , 'ejs');







app.get('/home' , async (req , res) =>{
    
    let master_specialites = await prisma.specialite.findMany({
        where : {
            palier : 'MASTER'
        }
    });

    console.log(master_specialites);

    let licence_specialites = await prisma.specialite.findMany({
        where : {
            palier : 'LICENCE'
        }
    });
   
    console.log(licence_specialites);

    let sections = await prisma.section.findMany();

   
    console.log(sections);
    
    return res.render('main' , {
        'licence' : licence_specialites,
        'master' : master_specialites,
        'sections' : sections 
    });  

});


app.get('/home/:semestre/:section_id' , async (req , res) =>{


      let section = await prisma.section.findUnique({
          where : {
              code_section : req.params.section_id
          }
      });

       
      let modules_ids = await prisma.moduleSpecialite.findMany({
          where : {
             code_specialite : section.code_specialite,
             anneeEtude : section.anneeEtude,
             semestre : parseInt(req.params.semestre)
          },
          select : {
            code_module : true,
         }
      });
      let ids = modules_ids.map(a => a.code_module);


      let modules_deja_planifier = await prisma.examen.findMany({
         
        where : {
            code_section : section.code_section,  
        }
        , 
         select : {
             code_module : true,
         }


      });

      let modules_planifier_ids = modules_deja_planifier.map(a => a.code_module)
     
      let modules = await prisma.module.findMany({
         where : {
             code_module : { in : ids , notIn : modules_planifier_ids },
         }

      });

      return res.render('planifier' , {
          'modules' : modules,
          'section' : section ,
      });

       

});


app.get('/home/:semestre/:section_id/:module_id' , async (req , res) => {

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

    
    // les creneaux where les salles disponibles:


    let creneaux_disponible = await prisma.reservation.findMany({
        select : {
            code_creneau : true
        },
        where : {
           disponible : true,
        }
    });

    let ids_disponibles = creneaux_disponible.map(element => element.code_creneau);


    // les creneaux interdits:

    let creneaux_interdits = await prisma.examen.findMany({

        select : {
           code_creneau : true
        },
        where : {
            code_section : section.code_section
        }
    });

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

app.post('/home/:semestre/:section_id/:module_id' , async (req , res) =>{

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
        }
    })

    let locaux = req.body.locaux;

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

            let examen_local = await prisma.localExamen.create({
                    data : {
                        code_creneau : exam.code_creneau,
                        code_module  : exam.code_module,
                        code_section : exam.code_section,
                        code_local : locaux[index],
                    }
                });
        }
    }
    res.redirect(`/home/${req.params.semestre}/${req.params.section_id}`)

})


app.get('/ajax/locaux_disponibles' , async (req , res)  => {

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




app.listen((3000) , ()=>{
      console.log('server running on port 3000 ...');
})


async  function need_it_later(req , res){
    
    const workbook = xlsx.readFile('test.xlsx');

    let worksheets = {};

    for(const sheetName of workbook.SheetNames){
        worksheets[sheetName] = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName])
    }
    const rows = worksheets.Sheet1;


    let locaux_created = [];

    for(let index in rows){


        const date = ExcelDateToJSDate(rows[index].Date);

        console.log(date)

        const heure = rows[index].Heure;
        const heures = heure.split('-');
        const heure_debut = heures[0];
        const horaire_debut = parseInt(heure_debut.split('H')[0]);
        const minute_debut =  parseInt(heure_debut.split('H')[1]);


        const heure_fin = heures[1];

        const horaire_fin = parseInt(heure_fin.split('H')[0]);
        const minute_fin =  parseInt(heure_fin.split('H')[1]);

        const start_time = new Date(date);
        start_time.setDate(start_time.getDate() - 1)
        start_time.setHours(horaire_debut+1);
        start_time.setMinutes(minute_debut);
        start_time.setSeconds(0);

        const end_time = new Date(date);
        end_time.setDate(end_time.getDate() - 1)
        end_time.setHours(horaire_fin+1);
        end_time.setMinutes(minute_fin);
        start_time.setSeconds(0)
   

       console.log(start_time);
       console.log(end_time);
          

       let exists_creneau = await prisma.creneau.findFirst({
           where : {
               date :  date ,
               start_time : start_time,
               end_time : end_time
           }
       });
       let new_creneau;
       if(! exists_creneau){

        new_creneau = await prisma.creneau.create({
            data : {
                date : date,
                start_time : start_time,
                end_time : end_time
            }
        });

       }else{
           new_creneau = exists_creneau;
       }
        



       

        const locaux = rows[index].Locaux.split(',');

        for(let local in locaux){
            let exists = await prisma.local.findUnique({
                where : {
                    code_local : locaux[local]
                }
            });
            let my_new_local;
            if(!exists){
                let new_local = await prisma.local.create({
                data : {
                   code_local : locaux[local],
                   capacite : 100
                }
               }).then((result) =>{
                  my_new_local = result;
                }).catch((err) =>{
                console.log(err);
            });
            }else{
               my_new_local = exists;
            }
            let reservation = await prisma.reservation.create({
                data : {
                    date : new_creneau.date ,
                    start_time : new_creneau.start_time ,
                    end_time : new_creneau.end_time,
                    code_local : my_new_local.code_local, 
                }
            })
            .then((result) => {
                console.log('Reservation created ..')
            })
            .catch((err) =>{
                console.log(err)
            })
       }
   
    
    
    }


}








function ExcelDateToJSDate(serial) {
    var utc_days  = Math.floor(serial - 25569);
    var utc_value = utc_days * 86400;                                        
    var date_info = new Date(utc_value * 1000);
 
    var fractional_day = serial - Math.floor(serial) + 0.0000001;
 
    var total_seconds = Math.floor(86400 * fractional_day);
 
    var seconds = total_seconds % 60;
 
    total_seconds -= seconds;
 
    var hours = Math.floor(total_seconds / (60 * 60));
    var minutes = Math.floor(total_seconds / 60) % 60;
 
    return new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate() + 1);
 }