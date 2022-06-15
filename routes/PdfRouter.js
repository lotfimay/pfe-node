const express = require('express');
const router = express.Router();

const pdfService = require('../services/pdf-service');
const pdfService2 = require('../services/pdf-pvexamen');
const pdfService3 = require('../services/pdf-emploi');

const { PrismaClient }  = require('@prisma/client');
const prisma = new PrismaClient();


const check_user = async(req , res , next) => {
    if(req.user.type != 'ENS' && req.user.type != 'SC'){
       return res.redirect('/');
    }
    else return next();
};

const check_user_2 = async(req , res , next) => {
    if(req.user.type != 'SC'){
       return res.redirect('/');
    }
    else return next();
};



router.get('/:section_id/:module_id/:session_id/pvexamen' , check_user ,async (req, res, next) => {
 
    console.log('Hello from pv');

    let data = await prisma.examen.findUnique({


        where : {
            code_section_code_module_session : {
                code_section : req.params.section_id,
                code_module : req.params.module_id,
                session : parseInt(req.params.session_id),
                
            }
        },
        select : {
            Creneau : {
                select : {
                    date : true,
                    start_time : true,
                }
            },
            code_module : true,
            session : true,
            semestre : true,
            Section : {
                select : {
                    code_section : true,
                    anneeEtude : true,
                    code_specialite : true,
                    nom_section : true
                }
            }
        }
    });

    let charge_cours = await prisma.chargeCours.findUnique({
        where : {
            code_section_code_module : {
                code_section : req.params.section_id,
                code_module : req.params.module_id,
            }
        },
        select  : {
            Enseignant : {
                select : {
                    code_enseignant : true,
                    nom_enseignant : true,
                    prenom_enseignant : true,
                }
            }
        }
    });

    let arr = [];
    if(charge_cours != null){
        arr.push(charge_cours.Enseignant.code_enseignant);
        data.chargeCours = `${charge_cours.Enseignant.nom_enseignant} ${charge_cours.Enseignant.prenom_enseignant}`;
    }else{
        data.chargeCours = `Chargé de cours non insérer`;
    }

    let locaux = await prisma.localExamen.findMany({
        where : {
            code_module : req.params.module_id,
            code_section : req.params.section_id,
        },
        select : {
            Local : {
                select : {
                    code_local : true,
                }
            }
        }
    });
    
    console.log(data);
    let locaux_presentation = '';
    for(let index in locaux){
        if(index < locaux.length - 1){
            locaux_presentation = locaux_presentation + locaux[index].Local.code_local + '+';
        }else{
            locaux_presentation = locaux_presentation + locaux[index].Local.code_local;
        }
    }

    let surveillants__ = await prisma.surveillance.findMany({
        where : {
            code_module : req.params.module_id,
            code_section : req.params.section_id,
            Enseignant : {
                code_enseignant : {notIn : arr}
            }
        },
        select : {
            Enseignant : {
                select : {
                    nom_enseignant : true,
                    prenom_enseignant : true,
                }
            }
        }
    });

  

    let surveillants = [];
    for(let index in surveillants__){
        surveillants.push(surveillants__[index].Enseignant.nom_enseignant + ' ' + surveillants__[index].Enseignant.prenom_enseignant);
    }

    data.surveillants = surveillants;
    data.locaux = locaux_presentation;
    

    switch(data.Section.anneeEtude){
        case 2:
            data.Section.niveau = 'L2';
            break;
        case 3:
            data.Section.niveau = 'L3';
            break;
        case 4:
            data.Section.niveau = 'M1';
            break;
        case 5:
                data.Section.niveau = 'M2';
                break;
    }

    var dd = String(data.Creneau.date.getDate()).padStart(2, '0');
    var mm = String(data.Creneau.date.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = data.Creneau.date.getFullYear();
    let result = dd + '/' + mm + '/' + yyyy;

    let result_ = (yyyy -1).toString();

    data.annee_universitaire = result_ + ' / ' + yyyy;
    
    data.Creneau.date = result;

    let tmp = data.Creneau.start_time.getHours() - 1 + ':'+ data.Creneau.start_time.getMinutes()+':00';
    
    data.Creneau.start_time = tmp;
    
    console.log(data);
   
    
    const stream = res.writeHead(200, {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment;filename=PV_EXAMEN_${data.code_module}_${data.Section.niveau}_${data.Section.code_specialite}_${data.Section.nom_section}.pdf`,
    });
    pdfService2.PVexamen(
      (chunk) => stream.write(chunk),
      () => stream.end(),
      data
    );
    
});

router.get('/:semestre/:session/:enseignant_id/convocation' ,check_user ,async (req , res) => {


    let enseignant = await prisma.enseignant.findUnique({
        where : {
            code_enseignant : parseInt(req.params.enseignant_id)
        }
    });
  

    let surveillances = await prisma.surveillance.findMany({
         
        where : {
            code_enseignant : parseInt(req.params.enseignant_id),
            LocalExamen : {
                Examen : {
                    semestre : parseInt(req.params.semestre),
                    session : parseInt(req.params.session),
                }
            }
        },
        select : {
            code_creneau : true,
            code_module : true,
            code_section : true,
        }
    });

    
    let annee_universitaire = '';
    for(let index in surveillances){
        
        let locaux = await prisma.localExamen.findMany({
            where : {
                code_creneau : surveillances[index].code_creneau,
                code_module : surveillances[index].code_module,
                code_section : surveillances[index].code_section,
            },
            select : {
                code_local : true,
            }
        });

         
        let locaux_presentation = '';

        for(let j in locaux){
            
            if(j == locaux.length - 1){
                locaux_presentation += locaux[j].code_local;
            }
            else locaux_presentation += locaux[j].code_local + '+';
        }

        let creneau = await prisma.creneau.findUnique({
            where : {
                code_creneau : surveillances[index].code_creneau
            }
        });
        
        var dd = String(creneau.date.getDate()).padStart(2, '0');
        var mm = String(creneau.date.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = creneau.date.getFullYear();
        let result = dd + '/' + mm + '/' + yyyy;

        let result_ = (yyyy -1).toString();

        annee_universitaire = result_ + ' / ' + yyyy;
        

        let tmp = creneau.start_time.getHours() - 1 + ':'+ creneau.start_time.getMinutes()+':00';


        surveillances[index].locaux_presentation = locaux_presentation;
        surveillances[index].date = result;
        surveillances[index].start_time = tmp;
        
    }

    let data = new Object();


    

    // if(surveillances.length >= 1){
    //     let semestre_session = await prisma.examen.findUnique({
    //         where : {
    //             code_module_code_section_code_creneau : {
    //                 code_creneau : surveillances[0].code_creneau,
    //                 code_module : surveillances[0].code_module,
    //                 code_section : surveillances[0].code_section,
    //             }
    //         },
    //         select : {
    //             semestre : true,
    //             session : true,
    //         }
    //     });
        
    //     data.semestre = semestre_session.semestre;
    //     data.session = semestre_session.session;
    // }

    
    data.semestre = req.params.semestre;
    data.session = req.params.session;
      
    
    data.surveillances = surveillances;
    data.Enseignant = enseignant;
    data.annee_universitaire = annee_universitaire;

    console.log(data);

    const stream = res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment;filename=CONVOCATION_SURVEILLANCES_${data.Enseignant.nom_enseignant}_${data.Enseignant.prenom_enseignant}.pdf`,
      });
      pdfService.buildPDF(
        (chunk) => stream.write(chunk),
        () => stream.end(),
        data
      );

});

router.get('/:semestre/:session/:section_id/plannings' , check_user_2,async(req , res) =>{
  
    let data = new Object();

    let annee_universitaire = '';
    let exams = await prisma.examen.findMany({
        where : {
            code_section : req.params.section_id,
            semestre : parseInt(req.params.semestre),
            session : parseInt(req.params.session),
        },
        select : {
            code_module : true,
            Creneau : {
                select : {
                    date : true,
                    start_time : true,
                }
            },
            LocalExamen : {
                select :{
                    Local : {
                        select : {
                            code_local : true,
                        }
                    }
                }
            }
        }
    });

    

    let section = await prisma.section.findUnique({
        where : {
            code_section : req.params.section_id,
        }
    });

    switch(section.anneeEtude){
        case 2:
            section.niveau = 'L2';
            break;
        case 3:
            section.niveau = 'L3';
            break;
        case 4:
            section.niveau = 'M1';
            break;
        case 5:
            section.niveau = 'M2';
            break;
    }

    data.section = section;
    data.exams = exams;
    


    for(let index in data.exams){
        let locaux_presentation = '';
        for(j in data.exams[index].LocalExamen){
            if( j < data.exams[index].LocalExamen.length - 1){
                locaux_presentation = locaux_presentation + data.exams[index].LocalExamen[j].Local.code_local + '+';
            }else{
                locaux_presentation = locaux_presentation + data.exams[index].LocalExamen[j].Local.code_local;
            }
        }

        var dd = String(data.exams[index].Creneau.date.getDate()).padStart(2, '0');
        var mm = String(data.exams[index].Creneau.date.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = data.exams[index].Creneau.date.getFullYear();
        annee_universitaire = (yyyy - 1).toString() + '/' + yyyy;
        let result = dd + '/' + mm + '/' + yyyy;
        data.exams[index].Creneau.date = result;
        let tmp = data.exams[index].Creneau.start_time.getHours() - 1 + ':'+ data.exams[index].Creneau.start_time.getMinutes()+':00';
        data.exams[index].Creneau.start_time = tmp;
        data.exams[index].locaux_presentation = locaux_presentation;
        delete exams[index].LocalExamen;
    }

    data.semestre = req.params.semestre;
    data.session = req.params.session;
    data.annee_universitaire = annee_universitaire;


    const stream = res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment;filename=PLANING_EXAMENS_${data.section.niveau}_${data.section.code_specialite}_${data.section.nom_section}.pdf`,
      });

    pdfService3.Emploi(
        (chunk) => stream.write(chunk),
        () => stream.end(),
        data
      );
    
});



module.exports = router;