import * as express from "express";
import * as bodyParser from "body-parser";

import * as jwt from 'jsonwebtoken';
import * as passport from 'passport';
import { jwtOptions } from './strategies';
import './strategies';
import { UserModel } from "./model";

const port = 4000;
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

app.post('/signup', async (req, res, next) => {
    passport.authenticate('signup', { session : false } , async (error, user, info) => {
        if(error===11000){
            return res.json({
                signup: false,
                message: "Email already in use"
            })
        }
        if(!user){
            return res.json({signup: false, message: info.message})
        }
        return res.json({signup: true, message: info.message, _id:user._id})
    })(req, res);
});

app.post('/login', async (req, res, next) => {
    passport.authenticate('login', {session: false}, async (err, user, info) => {
        try {
            if (err || !user) {
                return res.status(400).json({
                    login: false,
                    message: 'An error ocurred',
                    token: null,
                    error: '404'
                });
            }
            req.login(user, { session : false }, async (error) => {
            if( error ) {return res.send(error)}
            const token = jwt.sign({id: user._id,email:user.email},jwtOptions.secretOrKey,{expiresIn: '10h'});
            return res.json({login: true, message: 'Login sucessful', token: token });
            });     
        } catch (error) {
           return res.send(error.response);
        }
    })(req, res);
  });

app.post('/auth',passport.authenticate('jwt',{session: false}),(req,res)=>{
    res.json({authorized: true});
});

app.post('/changePassword', async (req,res)=>{
    UserModel.findById({_id: req.body.user}).then(user => {
        user.password = req.body.change;
        user.save();
        res.json({changed: true, value: null});
    });
});
app.listen(port, () => {
    console.log(`Auth Server is up on port ${port}`);
});