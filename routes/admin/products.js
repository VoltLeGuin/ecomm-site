//grouping require statememnts: 1. grabbing from external library, 
//2. files we wrote, 3. declaring variables...router
const express = require('express');
//const { validationResult } = require('express-validator'); no longer need with errorHandler middleware calling this
const multer = require('multer');

const { handleErrors, requireAuth } = require('./middlewares');
const productsRepo = require('../../repositories/products');
const productsNewTemplate = require('../../views/admin/products/new');
const productsIndexTemplate = require('../../views/admin/products/index');
const productsEditTemplate = require('../../views/admin/products/edit');
const { requireTitle, requirePrice } = require('./validators');

const router = express.Router();
//calling multer as 'upload' according to multer docs
//upload is now a middleware function
const upload = multer({ storage: multer.memoryStorage() });

//#1 route list products
router.get('/admin/products', requireAuth, async (req, res) => {
    const products = await productsRepo.getAll();
    res.send(productsIndexTemplate({ products: products }));
});

router.get('/admin/products/new', requireAuth, (req, res) => {
    res.send(productsNewTemplate({}));
});

router.post(
    '/admin/products/new', 
    requireAuth,
    upload.single('image'), 
    [requireTitle, requirePrice], 
    handleErrors(productsNewTemplate),
    async (req, res) => {
        const image = req.file.buffer.toString('base64');
        const { title, price } = req.body;
        await productsRepo.create({ title, price, image });

        res.send(res.redirect('/admin/products'));
    }
);

router.get('/admin/products/:id/edit', requireAuth, async (req, res) => {
    //.params is an Express function, like .query (returns JS object from query string)
    //req.params will return parameters in the matched route. 
    //If your route is /user/:id and you make a request to /user/5 - 
    //req.params would yield {id: "5"}
    //req.param is a function that peels parameters out of the request
    const product = await productsRepo.getOne(req.params.id);

    if(!product) {
        return res.send('Product not found');
    } 

    res.send(productsEditTemplate({ product }));
});

router.post('/admin/products/:id/edit', 
    requireAuth,
    upload.single('image'), 
    [requireTitle, requirePrice],
    handleErrors(productsEditTemplate, async (req) => {
        const product = await productsRepo.getOne(req.params.id);
        return { product: product };
    }),
    async (req, res) => {
        //'changes' to represent different changes from this form
        const changes = req.body;

        //was an image added?
        if(req.file) {
            changes.image = req.file.buffer.toString('base64');
        }
        try {
            await productsRepo.update(req.params.id, changes);
        } catch(err) {
            res.send('Could not find item');
        }

        res.redirect('/admin/products');
    }
);

router.post('/admin/products/:id/delete', requireAuth, async (req, res) => {
    await productsRepo.delete(req.params.id);

    res.redirect('/admin/products');
});

module.exports = router;