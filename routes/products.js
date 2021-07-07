const express = require('express');
const productsRepo = require('../repositories/products');
const productsIndexTemplate = require('../views/products/index');

const router = express.Router();

//root route to homepage
router.get('/', async (req, res) => {

    //getAll() returns an array of all products
    const products = await productsRepo.getAll();
    res.send(productsIndexTemplate({ products: products }));
});

module.exports = router;