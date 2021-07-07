const fs = require('fs');
const crypto = require('crypto');

module.exports = class Repository {
    //filename with be where we store users
    constructor(filename) {
        if(!filename) {
            throw new Error('you need a mutha fuckin filename');
        }

        this.filename = filename;
        try {
            //Node method that checks to see if a file exists on the harddrive
            //using the 'Sync' version because there is no async code allowed in a constructor
            //'Sync' refers to synchronous; asynchrnous verion is fs.access()
            fs.accessSync(this.filename);
        } catch(err) {
            //again using Sync version of a Node method because no async code allowed in a constructor
            fs.writeFileSync(this.filename, '[]');
        }
    }
    //attrs is short for attributes
    async create(attrs) {
        //attributes (attrs) is this object - { email: 'shit@shit.com', password: 'ifuwiwufnxwufx' }
        //take this object and add to array of Users and write that update to the users.json file
        //assign a random unique id to every user:
        attrs.id = this.randomId();
        //create and add new user...
        //first load our file of users:
        const records = await this.getAll();
        //2nd write user into array:
        records.push(attrs);
        //3rd write updated records back to harddrive (this.filename):
        await this.writeAll(records);

        return attrs;
    }
    async getAll() {
        //refactor time
        return JSON.parse(
            await fs.promises.readFile(this.filename, {
              encoding: 'utf8'
            })
          );
        //code before refactor
        // //open the file this.filename
        // const contents = await fs.promises.readFile(this.filename, { encoding: 'utf8' });
        // //read its contents
        // //parse its contents from JSON
        // const data = JSON.parse(contents);
        // //return the parsed data
        // return data;
    }
    async writeAll(records) {
        //write updated records back to harddrive (this.filename):
        await fs.promises.writeFile(this.filename, JSON.stringify(records, null, 2));
    }
    randomId() {
        //node js library has Crypto module...crypto.randomBytes()...
        //returns a buffer, so change to string in hex
        return crypto.randomBytes(4).toString('hex');
    }
    async getOne(id) {
        //pass in the id of the record we want to retrieve
        //1st get all of the records to check
        const records = await this.getAll();
        //2nd use find to check records for a record of the same id
        return records.find(record => record.id === id)
    }
    async delete(id) {
        const records = await this.getAll();
        const filteredRecords = records.filter(record => record.id !== id);
        await this.writeAll(filteredRecords);
    }
    async update(id, attrs) {
        const records = await this.getAll();
        const record = records.find(record => record.id === id);
        if(!record) {
            throw new Error(`Record with ID of ${id} not found`);
        }
        //copies properties from attrs to record object
        //easy way to update properties
        Object.assign(record, attrs)
        await this.writeAll(records);
    }
    async getOneBy(filters) {
        const records = await this.getAll();

        for(let record of records) {
            let found = true;
            for(let key in filters) {
                if(record[key] !== filters[key]) {
                    found = false;
                }
            } 
            if(found) {
                return record;   
            }  
        }
    }
}