'use strict';

require('dotenv').config();
const fs = require('node:fs').promises;
const path = require('node:path');
const mongoose = require('mongoose');
const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Review = require('../models/reviewModel');

const Models = [Tour, User, Review];

const args = process.argv;
const { NODE_ENV, DB_PASSWORD } = process.env;

if (NODE_ENV !== 'development') {
  console.log('(-) You are not in development mode!');
  process.exit(1);
}

const DB = process.env.DB_TOKEN.replace('<password>', DB_PASSWORD);

const CWD = process.cwd();
const DEV_DATA_PATH = '/dev-data/data';
const DATA_PATHS = ['tours.json', 'users.json', 'reviews.json'].map((file) =>
  path.join(CWD, DEV_DATA_PATH, file)
);

const deleteDevData = async () => {
  for (const Model of Models) await Model.deleteMany();
  console.log('(+) All data has been successfully deleted from the database!');
};

const importDevData = async () => {
  for (let i = 0; i < Models.length; i++) {
    const Model = Models[i];
    const DATA_PATH = DATA_PATHS[i];
    const json = await fs.readFile(DATA_PATH, 'utf8');
    const data = JSON.parse(json);
    await Model.create(data, { validateBeforeSave: false });
  }
  console.log('(+) All dev data has been successfully imported to database!');
};

const options = {
  '--delete': deleteDevData,
  '--import': importDevData,
};

(async () => {
  try {
    if (args.length > 2) {
      await mongoose.connect(DB);
      console.log('(+) Successfully connected to database!');
      for (const arg of args) {
        const option = options[arg];
        if (option) await option();
      }
      console.log('(+) All the work is done!');
    } else {
      console.log('(-) No work to do!');
    }
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.log(`(-) Failed to perform dev data managing: ${err}`);
    process.exit(1);
  }
})();
