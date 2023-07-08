# Natours - Udemy Course Project

  

*Note: This course project is for educational purposes only.*

  

**Natours** is a full web application project that includes both a website and an API. The project utilizes modern technologies such as `Node.js`, `Express`, `MongoDB`, `Mongoose`, `Stripe`, `Nodemailer`, `JWT`, `bcrypt`, and many others.

  

## Getting Started

  

To try this project, follow these steps:

  

1. Clone this repository to your local machine.

2. Fill in the environment variables in the `.env` file:

```plaintext

DB_USER=

DB_PASSWORD=

DB_TOKEN=

```

  

3. Fill environment variables related to JWT:

```plaintext

JWT_SECTER=

JWT_EXPIRES_IN=<number of days>

```

  

4. You can generate `JWT_SECTER` using `node:crypto` module:

```javascript

const  crypto = require('node:crypto');

  

console.log(crypto.randomBytes(16).toString('hex'));

```

  

5.  *(Optional)* You can change `PASSWORD_SALT_ROUNDS` and `PASSWORD_EXPIRES_IN=<number of days>`.

  

6. Fill environment variables related to `Nodemailer`:

```plaintext

EMAIL_USERNAME=

EMAIL_PASSWORD=

```

  

7.  *(Optional)* If you want to test production mode fill variables related to `SendGrid`:

```plaintext

SENDGRID_USERNAME=

SENDGRID_PASSWORD=

```

  

8. To enable test payments fill `STRIPE_SECRET_KEY` variable.

9. Save changes to `.env` file.

  

10. Also for payments provide stripe public key in `public/js/stripe.js`:

```javascript

const  stripe = Stripe('<your public key>');

```

  

11. To save changes, type `npm run build` command in your terminal to rebuild bundle file.

12. To upload dev data use `npm run reload:dev` command. It then reload all dev data to your MongoDB cluster.

  

*Note: The `npm run reload:dev` works only if your NODE_ENV in your `.env` file set to `development`*

  

13. All settings are done! Type `npm run dev` command to run application.

14. Go to `http://localhost:8000` to start testing website.

  

15. If you want to test production mode, change NODE_ENV variable to `production` in your env file.

  

*Note: Production mode reduce error logging, use `SendGrid` to send emails and use `Node` to run application, instead of `Nodemon`*

  

16. To try **Natours** API in Postman go to `https://documenter.getpostman.com/view/27884369/2s93zH1JfS` and click `Run in Postman` button. 
**There is a simple documentation to all endpoints.**
