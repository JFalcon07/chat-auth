"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const model_1 = require("./model");
const passportLocal = require("passport-local");
const passportJWT = require("passport-jwt");
const passport = require("passport");
const config_1 = require("./config");
const ExtractJwt = passportJWT.ExtractJwt;
const localStrategy = passportLocal.Strategy;
const JwtStrategy = passportJWT.Strategy;
exports.jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('jwt'),
    secretOrKey: 'SecretPhoenix'
};
mongoose.connect(config_1.mongoAddr + '/Auth', { useNewUrlParser: true }, (err) => {
    if (err) {
        console.log(err);
    }
});
mongoose.set('useCreateIndex', true);
passport.use('signup', new localStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, (email, password, done) => __awaiter(this, void 0, void 0, function* () {
    try {
        const user = yield model_1.UserModel.create({ email, password });
        return done(null, user, { message: 'Signup successful' });
    }
    catch (error) {
        return done(error.code);
    }
})));
passport.use('login', new localStrategy({
    usernameField: 'email',
    passwordField: 'password',
}, (email, password, done) => __awaiter(this, void 0, void 0, function* () {
    try {
        const user = yield model_1.UserModel.findOne({ email });
        if (!user) {
            return done(null, false, { message: 'User not found' });
        }
        var validate = yield model_1.UserSchema.methods.isValidPassword(password, user.password);
        if (!validate) {
            return done(null, false, { message: 'Wrong Password' });
        }
        return done(null, user, { message: 'Logged in Successfully' });
    }
    catch (error) {
        return done(error);
    }
})));
passport.use(new JwtStrategy(exports.jwtOptions, (token, done) => __awaiter(this, void 0, void 0, function* () {
    try {
        return done(null, token.id);
    }
    catch (error) {
        done(error);
    }
})));
