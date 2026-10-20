const express = require('express');
const router  = express.Router();
const SHA1 = require('sha1');
const { error } = require('winston');
const db = require('../utils/database.js');

router.get('/', (req, res) =>{
    db.query('SELECT * FROM books',(err, results) => {
        if (err){
            return res.status(500).json({ error: err.error });
        }

        return res.status(200).json(results);
    });
});

router.get('/:id', (req, res) => {
    let id = req.params.id;

    if (!id){
        return res.status(400).json({ error: 'Missing required fields!' });
    }

    db.query('SELECT * FROM books WHERE ID=?',[id],(err, results) => {
        if (err){
            return res.status(500).json({ error: err.error });
        }

        if (results.lenght == 0){
            return res.status(404).json({ error: "Ilyen könyv nem létezik!" });
        }

        return res.status(200).json(results);
    });
});

router.post('/', (req, res) => {
    let data = req.body;
    
    let fields = Object.keys(data);
    let values = Object.values(data);

    let titleIdx = fields.indexOf('title');
    let authorIdx = fields.indexOf('author');
    let categoryIdx = fields.indexOf('category');
    let publish_yearIdx = fields.indexOf('publish_year');
    let availableIdx = fields.indexOf('available');
    if (titleIdx < 0 || authorIdx < 0 || categoryIdx < 0 || publish_yearIdx < 0 || availableIdx < 0){
        return res.status(400).json({ error: 'Missing required fields!' });
    }

    db.query('SELECT * FROM books',(err, results) => {
        if (err){
            return res.status(500).json({ error: err.error });
        }

        if (results.lenght > 0)
        {
            for (const result of results) {
                if (result.author == values[authorIdx] && result.title == values[titleIdx] && result.category == values[categoryIdx] && result.publish_year == values[publish_yearIdx] && result.available == values[availableIdx]){
                    return res.status(404).json({ error: "Ilyen könyv már létezik!" });
                }
            }
        }

        fields = fields.join(', ')
        values = "'" + values.join("', '") + "'";

        db.query(`INSERT INTO books (${fields}) VALUES (${values})`,(err, results) => {
            if (err){
                return res.status(500).json({ error: err.error });
            }
            return res.status(201).json({ message: 'Könyv sikeresen hozzáadva.', id: results[0].id });
        });
    });
});

router.put('/:id', (req, res) => {
    let id = req.params.id;
    let data = req.body;
    
    let fields = Object.keys(data);
    let values = Object.values(data);

    let titleIdx = fields.indexOf('title');
    let authorIdx = fields.indexOf('author');
    let categoryIdx = fields.indexOf('category');
    let publish_yearIdx = fields.indexOf('publish_year');
    let availableIdx = fields.indexOf('available');
    if (titleIdx < 0 || authorIdx < 0 || categoryIdx < 0 || publish_yearIdx < 0 || availableIdx < 0 || !id){
        return res.status(400).json({ error: 'Missing required fields!' });
    }

    db.query('SELECT * FROM books',(err, results) => {
        if (err){
            return res.status(500).json({ error: err.error });
        }

        if (results.lenght == 0){
                return res.status(404).json({ error: "Ilyen könyv nem létezik!" });
            }

        for (const result of results) {
            if (result.ID != id)
            {
                if (result.author == values[authorIdx] && result.title == values[titleIdx] && result.category == values[categoryIdx] && result.publish_year == values[publish_yearIdx] && result.available == values[availableIdx]){
                    return res.status(404).json({ error: "Ilyen könyv már létezik!" });
                }
            }
        }

        db.query('SELECT * FROM books WHERE ID=?',[id],(err, results) => {
            if (err){
                return res.status(500).json({ error: err.error });
            }

            if (results.lenght == 0){
                return res.status(404).json({ error: "Ilyen könyv nem létezik!" });
            }

            if (results[0].author == values[authorIdx] && results[0].title == values[titleIdx] && results[0].category == values[categoryIdx] && results[0].publish_year == values[publish_yearIdx] && results[0].available == values[availableIdx]){
                return res.status(200).json({ error: "A könyv adatai nem változtak!" });
            }
            
            let updates = Object.entries(data).map(([key, value]) => `${key} = '${value}'`).join(',  ');

            db.query(`UPDATE books SET ${updates} WHERE ID=?`,[id],(err, results) => {
                if (err){
                    return res.status(500).json({ error: err.error });
                }
                return res.status(201).json({ message: 'Könyv sikeresen hozzáadva.', id: results[0].id });
            });
        });
    });
});

router.delete('/:id', (req, res) => {
    let id = req.params.id;

    if (!id){
        return res.status(400).json({ error: 'Missing required fields!' });
    }

    db.query('SELECT 1 FROM loans WHERE book_id = ? LIMIT 1',[id],(err, results) => {
        if (err){
            return res.status(500).json({ error: err.error });
        }

        if (results.lenght > 0){
            return res.status(404).json({ error: "Ezt a könyv még ki van bérelve!" });
        }

        db.query('DELETE FROM books WHERE ID=?', [id],(err, results) => {
            
        });
    });
});

module.exports = router;