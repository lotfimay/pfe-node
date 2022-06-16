const LocalStrategy = require("passport-local").Strategy;
const { PrismaClient }  = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");



function initialize(passport) {
  console.log("Initialized");
  

  const authenticateUser = async (email, password, done) => {
    
    console.log(email, password);
    const user = await prisma.users.findUnique({
      where : {
        email : email,
      }
    });

    if(user == null){
      return done(null, false, {
        message: "No user with that email"
      });
    }
    else{      
       if(await bcrypt.compare(password , user.password )){
            return done(null , user);
       }
       else{
          return done(null , false , {'message' : 'Wrong password'});
       }
    }
  };

  passport.use(
    new LocalStrategy(
      { usernameField: "email", passwordField: "password" },
      authenticateUser
    )
  );
  // Stores user details inside session. serializeUser determines which data of the user
  // object should be stored in the session. The result of the serializeUser method is attached
  // to the session as req.session.passport.user = {}. Here for instance, it would be (as we provide
  //   the user id as the key) req.session.passport.user = {id: 'xyz'}
  passport.serializeUser(
    (user, done) => {
        done(null, user.user_id.toString())       
    }
  );

  // In deserializeUser that key is matched with the in memory array / database or any data resource.
  // The fetched object is attached to the request object as req.user

  passport.deserializeUser(async (id, done) => {

    try{
         
          let user = await prisma.users.findUnique({
            where : {
              user_id : parseInt(id),
            },
            select : {
              user_id : true,
              user_name : true,
              email : true,
              type : true,
            }
          }
          );
          return done(null , user);
    }catch(err){
      return done(err);
    }
  });
}

module.exports = initialize;