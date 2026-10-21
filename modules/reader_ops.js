const express = require('express');
const router  = express.Router();
const { error } = require('winston');
const db = require('../utils/database.js');

router.get('/', (req, res) => {
    db.query('SELECT readers.* FROM readers', (err, results) => {
        if (err){
            return res.status(500).json({ error: err.error });
        }

        return res.status(200).json(results);
    });
});

router.get('/:id', (req, res) => {
    const id = req.params.id;

    db.query('SELECT readers.* FROM readers WHERE ID=?', [id], (err, results) => {
        if (err){
            return res.status(500).json({ error: err.error });
        }

        if (results.lenght == 0){
            return res.status(400).json({ error: 'Ilyen felhasználó nem létezik' });
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

router.put('/:id', (req, res) => {
    const id = req.params.id;
    let data = req.body;
    
    let fields = Object.keys(data);
    let values = Object.values(data);

    let emailIdx = fields.indexOf('email');
    let nameIdx = fields.indexOf('name');
    let phoneIdx = fields.indexOf('phone');

    db.query('SELECT readers.* FROM readers', (err, results) => {
        if (err){
            return res.status(500).json({ error: err.error });
        }

        if (results.lenght == 0){
            return res.status(404).json({ error: "Ilyen felhasználó nem létezik!" });
        }

        if (emailIdx > 0){
            for (const result of results) {
                if (result.ID != id)
                {
                    if (result.email == values[emailIdx]){
                        return res.status(404).json({ error: "Erre az email-ra nem változtathatja, mivel már létezik!" });
                    }
                }
            }
        }

        db.query('SELECT * FROM readers WHERE ID=?',[id], (err, results) => {
            if (err){
                return res.status(500).json({ error: err.error });
            }

            if (results.lenght == 0){
                return res.status(404).json({ error: "Ilyen felhasználó nem létezik!" });
            }

            let nochanges = false
            if (emailIdx > 0){
                if (results[0].email == values[emailIdx]){
                    nochanges = true
                }
            }

            if (nameIdx > 0){
                if (results[0].name == values[nameIdx]){
                    nochanges = true
                }
            }

            if (phoneIdx > 0){
                if (results[0].phone == values[phoneIdx]){
                    nochanges = true
                }
            }

            if (nochanges){
                return res.status(200).json({ error: "A felhasználó adatai nem változtak!" });
            }

            let updates = Object.entries(data).map(([key, value]) => `${key} = '${value}'`).join(',  ');
            
            db.query(`UPDATE readers SET ${updates} WHERE ID=?`,[id],(err, results) => {
                if (err){
                    return res.status(500).json({ error: err.error });
                }
                return res.status(201).json({ message: 'Felhasználó adatai sikeresen változtatva.' });
            });
        });
    });
});

router.delete('/:id', (req, res) => {
    const id = req.params.id;
    
    db.query('SELECT 1 FROM loans WHERE reader_id = ? LIMIT 1',[id],(err, results) => {
        if (err){
            return res.status(500).json({ error: err.error });
        }

        if (results.lenght > 0){
            return res.status(404).json({ error: "Ez a felhasználó még köcsönzés alatt van!" });
        }

        db.query('DELETE FROM readers WHERE ID=?', [id],(err, results) => {
            if (err){
                return res.status(500).json({ error: err.error });
            }

            if (results.affectedRows == 1){
                return res.status(200).json({message: 'Felhasználó sikeres törlése!'});
            }

            return res.status(200).json({message: 'No deletion occured'});
        });
    });
});

module.exports = router;