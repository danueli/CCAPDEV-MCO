const express = require('express');
const mongoose = require('mongoose');
const app = express();

mongoose.connect('mongodb://enzorosas_db_user:CURtLM4.eDsPHWT@ac-75jwuwg-shard-00-00.emfl2fn.mongodb.net:27017,ac-75jwuwg-shard-00-01.emfl2fn.mongodb.net:27017,ac-75jwuwg-shard-00-02.emfl2fn.mongodb.net:27017/bakehubdb?ssl=true&replicaSet=atlas-14b2hv-shard-0&authSource=admin&appName=Cluster0')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

app.listen(3000, () => {
  console.log('Running on http://localhost:3000');
});

const { engine } = require('express-handlebars');
app.engine('hbs', engine({ extname: '.hbs' }));
app.set('view engine', 'hbs');
app.set('views', './views');