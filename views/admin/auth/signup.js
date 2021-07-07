const layout = require('../layout');
const { getError } = require('../../helpers');

// const getError = (errors, prop) => {
//prop (property) is going to be equal to 'email' || 'password' || 'passwordConfirmation'
    // try {
        //two potential problems: 1. errors may be undefined, 
        //2. when we input a property ([prop].msg == ['email'].msg), there may not be a corresponding object
        //try catch is a good solution, but technically if statements are the correct solution...too much coding
        // return errors.mapped()[prop].msg 

        //errors.mapped() turns the errors array into an object 
        //with keys like {
        //     email: {
        //       msg: 'Invalid email'
        //     },
        //     password: {
        //       msg: 'Password too short'
        //     },
        //     passwordConfirmation: {
        //      msg: 'Passwords must match'            
        //     }
        //  }
//     } catch(err) {
//         return '';
//     }
// };

module.exports = ({ req, errors }) => {
    return layout({
      content: `
        <div class="container">
          <div class="columns is-centered">
            <div class="column is-one-quarter">
              <form method="POST">
                <h1 class="title">Sign Up</h1>
                <div class="field">
                  <label class="label">Email</label>
                  <input required class="input" placeholder="Email" name="email" />
                  <p class="help is-danger">${getError(errors, 'email')}</p>
                </div>
                <div class="field">
                  <label class="label">Password</label>
                  <input required class="input" placeholder="Password" name="password" type="password" />
                  <p class="help is-danger">${getError(errors, 'password')}</p>
                </div>
                <div class="field">
                  <label class="label">Password Confirmation</label>
                  <input required class="input" placeholder="Password Confirmation" name="passwordConfirmation" type="password" />
                  <p class="help is-danger">${getError(
                    errors,
                    'passwordConfirmation'
                  )}</p>
                </div>
                <button class="button is-primary">Submit</button>
              </form>
              <a href="/signin">Have an account? Sign In</a>
            </div>
          </div>
        </div>
      `
    });
  };  