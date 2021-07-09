// const fs = require('fs');
const crypto = require('crypto');
const util = require('util');
const Repository = require('./repository');

//promisify nodejs scrypt callback function
const scrypt = util.promisify(crypto.scrypt);

class UsersRepository extends Repository {
    //attrs is short for attributes
    async create(attrs) {
        //attributes (attrs) is this object - { email: 'me@test.com', password: 'ifuwiwufnxwufx' }
        //take this object and add to array of Users and write that update to the users.json file
        //assign a random unique id to every user:
        attrs.id = this.randomId();

        //create salt
        const salt = crypto.randomBytes(8).toString('hex');

        //callback version of scrypt is annoying, so going to use promisify version
        //...nodejs written pre-promises, all callbacks
        //use util.promisify(original function)
        const buf = await scrypt(attrs.password, salt, 64);

        //create and add new user...
        //first load our file of users:
        const records = await this.getAll();
        //2nd write user into array:
        const record = ({
            ...attrs, 
            password: `${buf.toString('hex')}.${salt}`
        });
        records.push(record);

        //3rd write updated records back to harddrive (this.filename):
        await this.writeAll(records);
        return record;
    }
    async comparePassword(saved, supplied) {
        //saved password = hashed password in a string with a '.' and then a salt on the end
        //supplied password = password user is using to signin
        // const result = saved.split('.');
        // const hash = result[0];
        // const salt = result[1];
        //or, shorter syntax, destructure:
        const [hashed, salt] = saved.split('.');
        const hashedSupplied = await scrypt(supplied, salt, 64);

        return hashed === hashedSupplied.toString('hex');
    }
} 

//why put in test() function? Because Node requires async-await to be put in a function
//may be available now or down the road
//const test = async () => { 
    //getting access to the users repository
    //const repo = new UsersRepository('users.json'); }
//test();
    
//export class...can do it this way because we are only making one copy
module.exports = new UsersRepository('users.json');
