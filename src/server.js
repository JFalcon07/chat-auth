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
const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const strategies_1 = require("./strategies");
require("./strategies");
const model_1 = require("./model");
const port = 4000;
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.post('/signup', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    passport.authenticate('signup', { session: false }, (error, user, info) => __awaiter(this, void 0, void 0, function* () {
        if (error === 11000) {
            return res.json({
                signup: false,
                message: "Email already in use"
            });
        }
        if (!user) {
            return res.json({ signup: false, message: info.message });
        }
        return res.json({ signup: true, message: info.message, _id: user._id });
    }))(req, res);
}));
app.post('/login', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    passport.authenticate('login', { session: false }, (err, user, info) => __awaiter(this, void 0, void 0, function* () {
        try {
            if (err || !user) {
                return res.status(400).json({
                    login: false,
                    message: 'An error ocurred',
                    token: null,
                    error: '404'
                });
            }
            req.login(user, { session: false }, (error) => __awaiter(this, void 0, void 0, function* () {
                if (error) {
                    return res.send(error);
                }
                const token = jwt.sign({ id: user._id, email: user.email }, strategies_1.jwtOptions.secretOrKey, { expiresIn: '10h' });
                return res.json({ login: true, message: 'Login sucessful', token: token });
            }));
        }
        catch (error) {
            return res.send(error.response);
        }
    }))(req, res);
}));
app.post('/auth', passport.authenticate('jwt', { session: false }), (req, res) => {
    res.json({ authorized: true });
});
app.post('/changePassword', (req, res) => __awaiter(this, void 0, void 0, function* () {
    model_1.UserModel.findById({ _id: req.body.user }).then(user => {
        user.password = req.body.change;
        user.save();
        res.json({ changed: true, value: null });
    });
}));
app.listen(port, () => {
    console.log(`Auth Server is up on port ${port}`);
});
