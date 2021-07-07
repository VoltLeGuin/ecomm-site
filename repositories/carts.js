const Repository = require('./repository');

class CartsRepostitory extends Repository {};

module.exports = new CartsRepostitory('carts.json');