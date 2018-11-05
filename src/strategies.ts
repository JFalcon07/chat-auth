import * as mongoose from 'mongoose';
import { UserModel, UserSchema } from "./model";
import * as passportLocal from 'passport-local';
import * as passportJWT from "passport-jwt";
import * as passport from 'passport';
import { mongoAddr } from './config';

const ExtractJwt = passportJWT.ExtractJwt;
const localStrategy = passportLocal.Strategy;
const JwtStrategy = passportJWT.Strategy;

export const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('jwt'),
    secretOrKey: 'SecretPhoenix'
}

mongoose.connect(mongoAddr + '/Auth',{  useNewUrlParser: true },(err)=>{
    if(err){
        console.log(err);
    }
});
mongoose.set('useCreateIndex', true);

passport.use('signup', new localStrategy({
    usernameField : 'email',
    passwordField : 'password'
}, async (email, password, done) => {
    try{
        const user = await UserModel.create({email, password});
        return done(null, user, { message: 'Signup successful' });
    } catch (error) {
        return done(error.code);
    }
}));

passport.use('login', new localStrategy({
    usernameField : 'email',
    passwordField : 'password',
}, async (email, password, done)=>{
    try{
        const user = await UserModel.findOne({ email });
        if(!user){
            return done(null,false,{ message: 'User not found' });
        }
        var validate = await  UserSchema.methods.isValidPassword(password,user.password);
        if(!validate){
            return done(null,false,{ message: 'Wrong Password'});
        }
        return done(null,user,{ message: 'Logged in Successfully'})
    } catch(error){
        return done(error);
    }
}));

passport.use(new JwtStrategy(jwtOptions, async(token,done) => {
    try {
        return done(null, token.id);
    } catch (error){
        done(error);
    }
}));