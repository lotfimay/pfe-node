const { PrismaClient }  = require('@prisma/client');
const prisma = new PrismaClient();
const xlsx = require('xlsx');
const fs = require('fs');

async  function readExcelFile(filename){

    
    const workbook = xlsx.readFile(filename);

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

            let exists_r = await prisma.reservation.findFirst({
                where : {
                    Creneau : {
                        date : new_creneau.date,
                        start_time : new_creneau.start_time,
                        end_time : new_creneau.end_time,
                    },
                    Local : {
                        code_local : my_new_local.code_local,
                    }
                }
            });

            if(! exists_r){

                let reservation = await prisma.reservation.create({
                    data : {
                        code_creneau : new_creneau.code_creneau,
                        code_local : my_new_local.code_local,
                        disponible : true 
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

module.exports = readExcelFile;