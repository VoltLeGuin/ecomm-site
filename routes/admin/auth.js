const express = require('express');
//const { check, validationResult } = require('express-validator'); no longer need
//import in instance of UsersRepository
const { handleErrors } = require('./middlewares');
const usersRepo = require('../../repositories/users');
const signupTemplate = require('../../views/admin/auth/signup');
const signinTemplate = require('../../views/admin/auth/signin');
const { requireEmail, requirePassword, requirePasswordValidation, requireEmailExists, requireValidPasswordForUser } = require('./validators');

const router = express.Router();

router.get('/signup', (req, res) => {
    res.send(signupTemplate({ req: req }));
});

//homemade body parser middleware function
// const bodyParser = (req, res, next) => {
//     //wrap logic in a check to make sure we are only applying this to post requests
//     if(req.method === 'POST') {
//         req.on('data', (data) => {
//             const parsed = data.toString('utf8').split('&');
//             const formData = {};
//             for(let pair of parsed) {
//                 const [ key, value ] = pair.split('=');
//                 formData[key] = value;
//             }
//             req.body = formData;
//             next();
//         })
//     } else {
//         next();
//     }
// }

router.post('/signup', [
    //express-validator library for better authentication
    //sanitize inputs...like trimming white space...Sanitizaiton Chain API
    //pass in an array vvvv
    requireEmail,
    requirePassword,
    requirePasswordValidation
],
handleErrors(signupTemplate), 
async (req, res) => {


    //moved all of error handling below to middleware.js, handleErrors()
    //express validator...imported validationResult which 
    //returns an array of objects explaining errors
    // const errors = validationResult(req);
    // if(!errors.isEmpty()) {
    //     return res.send(signupTemplate({ req, errors }));
    // }
    //use req.body.email, req.body.password to check inputs...Express uses req.body for request data
    const { email, password } = req.body;

    //merged with express validator
    // if(password !== passwordConfirmation) {
    //     return res.send('Passwords must match');
    // }

    //create a user in our user repository to represent ths person
    const user = await usersRepo.create({ email: email, password: password })

    //...use third party package library...managing cookies is tricky 
    //store this user's id inside the user's cookie
    //cookie library adds an additional method: req.session
    //creates an object that we can put whatever in
    //userId is a key in this session object (can use any name there)
    req.session.userId = user.id;
    

    //parsing by hand without using library...I actually got it right woohoo
    // req.on('data', (data) => {
    //     const parsed = data.toString('utf8').split('&');
    //     const formData = {};
    //     for(let pair of parsed) {
    //         const [ key, value ] = pair.split('=');
    //         formData[key] = value;
    //     }
    //     console.log(formData);
    // })
    res.redirect('/admin/products'); 
})

router.get('/signout', (req, res) => {
    //clears the cookie to signout
    req.session = null;
    res.send('You are logged out');
})

router.get('/signin', (req, res) => {
    res.send(signinTemplate({}));
})

router.post('/signin', [
    requireEmailExists,
    requireValidPasswordForUser
], 
handleErrors(signinTemplate),
async (req, res) => {
    //moved stuff below to middleware.js, handleErrors
    // const errors = validationResult(req);

    // if(!errors.isEmpty()) {
    //     return res.send(signinTemplate({ errors }));
    // }

    const { email } = req.body;

    const user = await usersRepo.getOneBy({ email: email });

    //reapply the cookie to the user id
    req.session.userId = user.id;

    res.redirect('/admin/products');
})

module.exports = router;