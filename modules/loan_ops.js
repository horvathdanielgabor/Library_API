const express = require('express');
const router  = express.Router();
const { error } = require('winston');
const db = require('../utils/database.js');

router.get('/', (req, res) => {
    db.query('SELECT (SELECT books.title FROM books WHERE books.ID = loans.book_id), (SELECT readers.name FROM readers WHERE readers.ID = loans.reader_id) FROM loans', (err, results) => {
        if (err){
            return res.status(500).json({ error: err.error });
        }

        return res.status(200).json(results);
    });
});

router.get('/:id', (req, res) => {
    const id = req.params.id;

    db.query('SELECT * FROM loans WHERE ID=?', [id], (err, results) => {
        if (err){
            return res.status(500).json({ error: err.error });
        }

        return res.status(200).json(results);
    });
});

router.post('/', (req, res) => {
    let data = req.body;
    
    let fields = Object.keys(data);
    let values = Object.values(data);

    let nameIdx = fields.indexOf('name');
    let emailIdx = fields.indexOf('email');

    if (nameIdx < 0, emailIdx < 0){
            return res.status(409).json({ error: 'Missing required fields!' });
    }

    db.query('SELECT readers.* FROM readers', (err, results) => {
        if (err){
            return res.status(500).json({ error: err.error });
        }

        if (results.lenght > 0)
        {
            for (const result of results) {
                if (result.email == values[emailIdx]){
                    return res.status(409).json({ error: "Felhasználó ezzel az email címmel már létezik!" });
                }
            }
        }

        fields = fields.join(', ')
        values = "'" + values.join("', '") + "'";

        db.query(`INSERT INTO readers (${fields}) VALUES (${values})`,(err, results) => {
            if (err){
                return res.status(500).json({ error: err.error });
            }
            return res.status(201).json({ message: 'Felhasználó sikeresen hozzáadva.' });
        });
    });
});

module.exports = router;