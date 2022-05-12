
const express = require('express');
const { render, redirect } = require('express/lib/response');
const fs = require('fs');
const morgan = require('morgan');
const xlsx = require('xlsx');
const app = express();
const { PrismaClient }  = require('@prisma/client');
const prisma = new PrismaClient();
const pdfService = require('./services/pdf-service');

const planificationRouter = require('./routes/PlanificationRouter');
const ajaxRouter = require('./routes/AjaxRouter');



app.use(express.static('public'));
app.use(express.urlencoded({extended : true}));
app.use(morgan('dev'));
app.use(express.json());
app.set('view engine' , 'ejs');


app.get('/surveillance' , (req , res) => {
    return res.render('surveillance');
});

app.get('/surveillance/:semestre_id/:section_id/:module_id' , async (req , res) =>{

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
    console.log(locaux);
    return res.render('locaux' , {
        'locaux' : locaux,
        'semestre' : req.params.semestre_id,
        'section' : req.params.section_id,
        'module' : req.params.module_id,
    });


});

app.get('/surveillance/:semestre_id/:section_id/:module_id/:local_id' , async (req , res)=>{
  return res.render('affecter_surveillants');
});
// ---------- staaaart ajaaaaaaaaaax ------------
app.use('/ajax' , ajaxRouter)

// --------------------- end ajaaaaaaaaaaaaaaaaaxxxxxxxxxxxxx------------

app.get('/' , async (req , res) =>{
    return res.render('main');  
});



app.get('/consulter' , async (req , res) =>{
    res.render('consulter');
})

app.get('/consulter/:semestre/:section_id' , async(req , res) => {
    let exams = await prisma.examen.findMany({
        where : {
            code_section : req.params.section_id,
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
    return res.render('consulter_planning' , {
        'exams' : exams,
        'niveau' : niveau,
        'section' : section
    });
});


// ------------------- start planification --------------------------
app.use('/planifier' , planificationRouter)
// ---------------- end planification -----------------------------------

app.get('/invoice', (req, res, next) => {
    const invoice = {
      shipping: {
          name: 'John Doe',
          address: '1234 Main Street',
          city: 'San Francisco',
          state: 'CA',
          country: 'US',
          postal_code: 94111,
        },
      items:   [
          {
              date: '2022-15-31',
              horaire: '10:15:00',
              module: 'Algorithme',
              salles: '315D+221D+151D',
          },
          {
              date: '2022-15-31',
              horaire: '10:15:00',
              module: 'Algorithme',
              salles: '315D+221D+151D',
          },
      ],
      subtotal: 8000,
      paid: 0,
      invoice_nr: 1234,
    };
    
    const stream = res.writeHead(200, {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment;filename=invoice.pdf',
    });
    pdfService.buildPDF(
      (chunk) => stream.write(chunk),
      () => stream.end(),
      invoice
    );
  });
app.use((req , res) =>{
    res.status(404).json('Page not found');
     
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