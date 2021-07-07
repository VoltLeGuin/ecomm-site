const { validationResult } = require('express-validator');

module.exports = {
//only differences in each error handler are the templates, 
//so passing in template as an argument
//to fix problem with error handling on the edit.js edit product template,
//added dataCb - data callback
    handleErrors(templateFunc, dataCb) {
        //middleware function needs a next command bc express was written before promises or async/await, 
        //so you have to tell express that you are done and ready for next command
        return async (req, res, next) => {
            const errors = validationResult(req);

            if(!errors.isEmpty()) {
                //create data variable to capture outcome of dataCd
                let data = {};
                //check if dataCb exists because it is an optional callback function
                if(dataCb) {
                    data = await dataCb(req);
                }
                return res.send(templateFunc({ errors, ...data }));
            }

            next();
        };
    },
    //this one simpler because this one does not 
    //need to be customized or have an argument passed
    requireAuth(req, res, next) {
        if(!req.session.userId) {
            return res.redirect('/signin');
        }
        next();
    }
};