const globalMiddleware = require("./globalMiddlewares");

const check_user = async(req , res , next) => {
    if(req.user.type != 'IA' && req.user.type != 'SI'){
       return res.redirect('/');
    }
    else return next();
};

const check_user_2 = async(req , res , next) => {
   if(req.user.type != 'IA' && req.user.type != 'SI' && req.user.type != 'VD' && req.user.type != 'SC'){
      return res.redirect('/');
   }
   else return next();
};

const check_user_3 = async(req , res , next) =>{

    if(req.user.type != 'VD' && req.user.type != 'SC'){
        globalMiddleware.check_departement_coherence(req , res , next);        
    }
    else return next();
}



module.exports = {
    check_user,
    check_user_2,
    check_user_3,
}