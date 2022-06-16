const { PrismaClient }  = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");


const ajouter_utilisateur = async (req , res) =>{

    const departements = await prisma.departement.findMany();
    

    res.render('ajouter_utilisateur' , {
        'departements' : departements,
        'message' : '',
        'user' : req.user
    });
}

const ajouter_utilisateur_post = async (req , res ,) =>{

    const departements = await prisma.departement.findMany();

    try{
     const hashed_password  = await bcrypt.hash(req.body.password , 10);


     const new_user = await prisma.users.create({
         data : {
             user_name : req.body.username,
             password : hashed_password , 
             email : 'lotfimayouf@gmail.com',
             type : req.body.type,
         }
     });

    }catch(err){
     
     console.log(err);
    }

 
  
 res.render('ajouter_utilisateur' , {
     'message' : 'user created successfully',
     'departements' : departements,
     'user' : req.user,
 });
}

module.exports = {
    ajouter_utilisateur,
    ajouter_utilisateur_post,
}