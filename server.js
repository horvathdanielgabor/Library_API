require('dotenv').config();
const express = require('express');
const cors = require('cors');

const bookRoutes = require('./modules/book_ops');
const loanRouts = require('./modules/loan_ops');
const readerRouts = require('./modules/reader_ops');

const app = express();

//Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send('Welcome to the Generic NodeJS API');
});

app.use('/api/books',  bookRoutes);
app.use('/api/loans', loanRouts);
app.use('/api/readers', readerRouts);

app.listen(process.env.APP_Port, () => {
    console.log(`Server is ruinning on port http://localhost:${process.env.APP_PORT}.`);
});