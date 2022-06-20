const { PrismaClient }  = require('@prisma/client');
const prisma = new PrismaClient();

const espace_enseignant_index = async (req , res) =>{
    
    let is_charge = false;
    let flag = false;

    let user_name = req.user.user_name;
    let full_name = user_name.split('_');
    let nom = full_name[0].toUpperCase();
    let prenom = full_name[1].toUpperCase();

    req.user.nom_enseignant = nom;
    req.user.prenom_enseignant = prenom;

    let enseignant = await prisma.enseignant.findUnique({
        where : {
            email : req.user.email,
        }
    });
    let charge_cours = await prisma.chargeCours.findFirst({
        where: {
            code_enseignant : enseignant.code_enseignant,
        }
    });
    if(charge_cours != null){
        is_charge = true;
    }
    let surveillances = await prisma.surveillance.findFirst({
        where : {
            code_enseignant : req.user.code_enseignant,
        }
    });
    if(surveillances != null){
        flag = true;
    }

    console.log(enseignant.code_enseignant);

    let text1;
    let nb1;

    let text2;
    let nb2;

    let text3;
    let nb3;

    let text4;
    let nb4;

    let modules;
    let locaux;
    let enseignants;
    let departements;


    let labels_2 = [];
    let data_2 = [];


    let specialites;



    text1 = 'Modules';
    modules = await prisma.module.findMany({
        distinct : ['code_module'],
    })
    nb1 = modules.length;
    text2 = 'Salles'
    locaux = await prisma.local.findMany(
            { distinct : ['code_local'] }
    );
    nb2 = locaux.length;
    text3 = 'Surveillants'
    enseignants = await prisma.enseignant.findMany({
            distinct : ['code_enseignant']
    })
    nb3 = enseignants.length;
    text4 = 'Départements';
    departements = await prisma.departement.findMany({
            distinct : ['code_departement']
    });
    nb4 = departements.length;
    labels_2.push('SI' , 'IA');
    specialites = await prisma.specialite.findMany();
    data_2.push(specialites.filter(element => element.code_departement == 'SI').length);
    data_2.push(specialites.filter(element => element.code_departement == 'IA').length);

    let surveillants = await prisma.enseignant.findMany();
    let labels = [];
    labels.push('MCA');
    labels.push('MCB');
    labels.push('PROF');
    let arr = [];
    arr.push(surveillants.filter(element => element.code_grade == 'MCA').length);
    arr.push(surveillants.filter(element => element.code_grade == 'MCB').length);
    arr.push(surveillants.filter(element => element.code_grade == 'PROF').length);












    return res.render('main_enseignant', {
        'user' : req.user,
        'is_charge' : is_charge,
        'flag' : flag,
        'code_enseignant' : enseignant.code_enseignant,
        'text1' : text1,
        'text2' : text2,
        'text3' : text3,
        'text4' : text4,
        'nb1' :   nb1,
        'nb2' :   nb2,
        'nb3' :   nb3,
        'nb4' :   nb4,
        'labels' : labels,
        'data' : arr,
        'labels_2' : labels_2,
        'data_2' : data_2,
    })

}

const espace_enseignant_convocations = async(req , res) =>{

    let is_charge = false;
   
    let user_name = req.user.user_name;
    let full_name = user_name.split('_');
    let nom = full_name[0].toUpperCase();
    let prenom = full_name[1].toUpperCase();

    req.user.nom_enseignant = nom;
    req.user.prenom_enseignant = prenom;

    let enseignant = await prisma.enseignant.findUnique({
        where : {
            email : req.user.email,
        }
    });
    let charge_cours = await prisma.chargeCours.findFirst({
        where: {
            code_enseignant : enseignant.code_enseignant,
        }
    });
    if(charge_cours != null){
        is_charge = true;
    }
    let surveillances = await prisma.surveillance.findFirst({
        where : {
            code_enseignant : req.user.code_enseignant,
        }
    });
    if(surveillances != null){
        flag = true;
    }

    res.render('generer_convocations' ,{
        'user' : req.user,
        'is_charge' : is_charge,
        'code_enseignant' : enseignant.code_enseignant
        
    });


}

const espace_eseignant_pvs = async(req , res) =>{


    
    let is_charge = false;
   
    let user_name = req.user.user_name;
    let full_name = user_name.split('_');
    let nom = full_name[0].toUpperCase();
    let prenom = full_name[1].toUpperCase();

    req.user.nom_enseignant = nom;
    req.user.prenom_enseignant = prenom;

    let enseignant = await prisma.enseignant.findUnique({
        where : {
            email : req.user.email,
        }
    });
    let charge_cours = await prisma.chargeCours.findFirst({
        where: {
            code_enseignant : enseignant.code_enseignant,
        }
    });
    if(charge_cours != null){
        is_charge = true;
    }
    let surveillances = await prisma.surveillance.findFirst({
        where : {
            code_enseignant : req.user.code_enseignant,
        }
    });
    if(surveillances != null){
        flag = true;
    }



      let sections = await prisma.chargeCours.findMany({
           where : {
            code_enseignant : enseignant.code_enseignant,
           },
           select : {
              Section : true
           }  
      });

      for(let index in sections){
         switch(sections[index].Section.anneeEtude){
            case 2:
                sections[index].Section.niveau = 'L2';
                break;
            case 3:
                sections[index].Section.niveau = 'L3';
                break;
            case 4:
                sections[index].Section.niveau = 'M1';
                break;
            case 5:
                sections[index].Section.niveau = 'M2';
                break;
         }
      }
      let data = new Object();
      data.sections = sections;

      console.log(data);
      
      res.render('generer_pv_ens' , {
        'data' : data,
        'user' : req.user,
        'is_charge' : is_charge,
        'code_enseignant' : enseignant.code_enseignant,
      });
}

const espace_enseignant_consulter = async(req , res) =>{
    
    let is_charge = false;
    let user_name = req.user.user_name;
    let full_name = user_name.split('_');
    let nom = full_name[0].toUpperCase();
    let prenom = full_name[1].toUpperCase();

    req.user.nom_enseignant = nom;
    req.user.prenom_enseignant = prenom;

    let enseignant = await prisma.enseignant.findUnique({
        where : {
            email : req.user.email,
        }
    });
    let charge_cours = await prisma.chargeCours.findFirst({
        where: {
            code_enseignant : enseignant.code_enseignant,
        }
    });
    if(charge_cours != null){
        is_charge = true;
    }
    let surveillances = await prisma.surveillance.findFirst({
        where : {
            code_enseignant : req.user.code_enseignant,
        }
    });
    if(surveillances != null){
        flag = true;
    }

    res.render('consulter',{
        'user' : req.user,
        'is_charge' : is_charge,
        'code_enseignant' : enseignant.code_enseignant,
    });

}

const espace_enseignant_plannings = async(req , res) =>{

    let is_charge = false;
    let user_name = req.user.user_name;
    let full_name = user_name.split('_');
    let nom = full_name[0].toUpperCase();
    let prenom = full_name[1].toUpperCase();

    req.user.nom_enseignant = nom;
    req.user.prenom_enseignant = prenom;

    let enseignant = await prisma.enseignant.findUnique({
        where : {
            email : req.user.email,
        }
    });
    let charge_cours = await prisma.chargeCours.findFirst({
        where: {
            code_enseignant : enseignant.code_enseignant,
        }
    });
    if(charge_cours != null){
        is_charge = true;
    }
    let surveillances = await prisma.surveillance.findFirst({
        where : {
            code_enseignant : req.user.code_enseignant,
        }
    });
    if(surveillances != null){
        flag = true;
    }
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
    console.log(exams);
    console.log(req.user);


    return res.render('consulter_planning' , {
        'exams' : exams,
        'niveau' : niveau,
        'section' : section,
        'semestre' : req.params.semestre,
        'session' : req.params.session,
        'user' : req.user,
        'is_charge' : is_charge,
        'code_enseignant' : enseignant.code_enseignant,
    });



}

module.exports = {
    espace_enseignant_index,
    espace_enseignant_convocations,
    espace_eseignant_pvs,
    espace_enseignant_consulter,
    espace_enseignant_plannings
}