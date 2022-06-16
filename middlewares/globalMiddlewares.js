const { PrismaClient }  = require('@prisma/client');
const prisma = new PrismaClient();

const check_departement_coherence = async(req , res , next) =>{
    let departement = await prisma.section.findUnique({
        where : {
            code_section  : req.params.section_id,
        },
        select : {
            Specialite : {
                select : {
                    Departement : {
                        select : {
                            code_departement : true,
                        }
                    }
                }
            }
        }
    });
    if(departement.Specialite.Departement.code_departement != req.user.type){
        return res.redirect('/');
    }
    else return next();
}

const  checkAuthenticated = async (req, res, next) => {
    if (req.isAuthenticated()) {
      return res.redirect('/');
    }
    next();
  }
  
const  checkNotAuthenticated = async (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/login');
}

const check_not_enseignant = async(req , res , next) =>{
    if(req.user.type == 'ENS'){
        return res.redirect('/espace-enseignant');
    }
    else return next();
}
const check_enseignant = async (req , res , next) =>{
 
    if(req.user.type != 'ENS'){
      return res.redirect('/')
    }
    else return next();

}
const check_not_service_p = async(req , res , next) =>{
    if(req.user.type == 'SP'){
        return res.redirect('/');
    }
    else return next();
}
const check_surveillance_viewer = async(req , res , next) =>{

    if(req.user.type != 'IA' && req.user.type != 'VD' && req.user.type != 'SI' &&  req.user.type != 'SC'){
        return res.redirect('/');
    }
    else return next();
}
const check_planning_viewer  = async(req , res , next) =>{
   if(req.user.type == 'IA' || req.user.type == 'SI' ){
      return check_departement_coherence(req , res , next);
   }
   
   else return next();
    
}

const check_service_p = async(req , res , next) =>{
    if(req.user.type != 'SP'){
        return res.redirect('/');
    }
    else return next();
}

const check_vd = async(req , res , next) =>{
    if(req.user.type != 'VD'){
      return res.redirect('/');
    }
    else return next();
}
const check_ia_si = async(req , res , next) =>{
    if(req.user.type != 'IA' && req.user.type != 'SI'){
         return res.redirect('/')
    }
    else next();
}

const check_enseignants_viewer = async(req , res , next) =>{
    if(req.user.type != 'SC' && req.user.type != 'VD' && req.user.type != 'SP' ){
        return res.redirect('/');
    }
    else return next();
} 


module.exports = {
    check_departement_coherence,
    checkNotAuthenticated,
    checkAuthenticated,
    check_not_enseignant,
    check_enseignant,
    check_not_service_p,
    check_surveillance_viewer,
    check_planning_viewer,
    check_service_p,
    check_vd,
    check_ia_si,
    check_enseignants_viewer,
}