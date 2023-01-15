require('dotenv').config();
const sequelize = require('./db');
const express = require('express');
const model = require('./model');
const cors = require('cors');
const router = require('./router')
const errorHandler = require('./middleware/ErrorHandlingMiddleware');
const port = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', router);
app.use(errorHandler);

app.get('/', (req, res) => {
  res.status(200).json({ message: 'WORKING!!' })
})

const start = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    app.listen(port, () => console.log(`Server started on port ${port}`));
  } catch (e) {
    console.log(e);
  }
};

start();






// configuration

// const mysql = require('mysql2');
//
// const connection = mysql.createConnection({
//   host: 'localhost',
//   user: 'root',
//   password: 'password',
//   database: 'crmdb',
// });
//
// connection.connect((err) => {
//   if (err) {
//     console.log(err);
//     return err;
//   } else {
//     console.log('database -------- ok');
//   }
// });
