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

module.exports =  {
    check_user ,
    check_user_2,
}