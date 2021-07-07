const { check } = require('express-validator');
const usersRepo = require('../../repositories/users');


module.exports = {
    //******check the title property (title is the 'name' in the html of the input)
    requireTitle: check('title')
        .trim()
        .isLength({ min: 5, max: 40 })
        .withMessage('Must be between 5 and 40 characters'),
    requirePrice: check('price')
        .trim()
        //server always receives a string, toFloat() or toInt() are used to change strng to number
        .toFloat()
        //isFloat or isInt requires a number, checks to make sure at least a value of 1
        .isFloat({ min: 1 })
        .withMessage('Must be a number greater than 1'),
    //imported from auth.js and assigned to requireEmail:
    requireEmail: check('email')
        .trim()
        .normalizeEmail()
        .isEmail()
        .withMessage('Must be a valid email')
        //make custom validator for checking for existing user
        .custom(async (email) => {
            const existingUser = await usersRepo.getOneBy({ email: email });
            if(existingUser) {
                throw new Error('Email in use')
            }
        }),
    requirePassword: check('password')
        .trim()
        .isLength({ min: 4, max: 20 })
        .withMessage('Must be between 4 and 20 characters'),
    requirePasswordValidation: check('passwordConfirmation')
        .trim()
        .isLength({ min: 4, max: 20 })
        .withMessage('Must be between 4 and 20 characters')
        //make custom validator for doing password confirmation
        .custom((passwordConfirmation, { req }) => {
            // const req = obj.req;
            // if(passwordConfirmation !== req.body.password) {
            //     throw new Error('Passwords must match');
            // }
            if (passwordConfirmation !== req.body.password) {                 
                throw new Error('Passwords must match');             
            } else {                 
                return true;             
            }
    }),
    requireEmailExists: check('email')
        .trim()
        .normalizeEmail()
        .isEmail()
        //withMessage, the missing class...replaces vague error message with Express Validator
        .withMessage('Must provide a valid email')
        .custom(async (email) => {
            const user = await usersRepo.getOneBy({ email: email });
            if(!user) {
                throw new Error('Email not found!');
            }
        }),
    requireValidPasswordForUser: check('password')
        .trim()
        .custom(async (password, { req }) => {
            const user = await usersRepo.getOneBy({ email: req.body.email });
            if(!user) {
                throw new Error('Invalid Password')
            }
            const validPassword = await usersRepo.comparePassword(user.password, password);

            if(!validPassword) {
                throw new Error('Invalid Password');
            }
        })
}