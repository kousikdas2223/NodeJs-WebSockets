const express = require('express');
const feedRoute = require('./routes/feed');
const authRoute = require('./routes/auth');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const app = express();

//app.use(bodyParser.urlencoded()); // x-www-form-urlencoded for the forms in the views

const fileStorage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'images');
    },
    filename: function(req, file, cb) {
        cb(null, uuidv4())
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg'
    ) {
        cb(null, true);
    } else {
        cb(null, false);
    }
}

app.use(bodyParser.json()) // For REST APIs applicatio/json

app.use(multer({
    storage: fileStorage, fileFilter: fileFilter
}).single('image'));

app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); next();
});
app.use('/feed', feedRoute);
app.use('/auth', authRoute);

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data});
});

mongoose.connect('mongodb+srv://daskousik2223:dk338142@cluster0.jxx4h.mongodb.net/messages')
.then(result => {
    const server = app.listen(8080);
    const io = require('./socket').init(server);
    console.log('Reached');
    io.on('connection', socket => {
        console.log('###############',socket);
        if(socket){
            console.log('Client connected');
        }
        else{
            console.log('Client is not connected');
        }
    });
  })
  .catch(err => console.log(err));