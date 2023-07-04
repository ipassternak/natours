'use strict';

require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');

const PORT = process.env.PORT || 8000;

const { DB_PASSWORD } = process.env;
const DB = process.env.DB_TOKEN.replace('<password>', DB_PASSWORD);

mongoose
  .connect(DB)
  .then(() => console.log('Connected to database successfully'))
  .catch((err) => {
    console.log(`Failed connection to database: ${err.message}`);
    console.log('Shutting down the aplication...');
    process.exit(1);
  });

const server = app.listen(PORT, () => {
  console.log(`Listening at http:/localhost:${PORT}`);
});

['SIGINT', 'SIGTERM'].forEach((signal) => {
  process.on(signal, async () => {
    console.log('Closing connection to the database...');
    await mongoose.disconnect();
    console.log('Shutting down the server...');
    server.close();
  });
});
