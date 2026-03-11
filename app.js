const express = require('express');
const mongoose = require('mongoose');
const { engine } = require('express-handlebars');

const app = express();

// MongoDB connection
// Kindly change the connection string by adding ur username and ps
// Syntax: 'mongodb://<username>:<password>@ac----
mongoose.connect('mongodb://danieldabuit_db_user:1234@ac-75jwuwg-shard-00-00.emfl2fn.mongodb.net:27017,ac-75jwuwg-shard-00-01.emfl2fn.mongodb.net:27017,ac-75jwuwg-shard-00-02.emfl2fn.mongodb.net:27017/bakehubdb?ssl=true&replicaSet=atlas-14b2hv-shard-0&authSource=admin&appName=Cluster0')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// view engine setup
app.engine('hbs', engine({ extname: '.hbs' }));
app.set('view engine', 'hbs');
app.set('views', './views');

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// Start server
app.listen(3000, () => {
  console.log('Running on http://localhost:3000');
});
