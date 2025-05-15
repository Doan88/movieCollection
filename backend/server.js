// StAuth10244: I Thanh Truong Doan, 000918024 certify that this material is my original work. No other person's work has been used without due acknowledgement. I have not made my work available to anyone else.

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const db = new sqlite3.Database('movies.db'); // Connect to the SQLite database

// Middleware to parse JSON bodies and allow CORS
app.use(express.json());
app.use(cors());

// Create the 'movies' table 
db.run(`CREATE TABLE IF NOT EXISTS movies
(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    director TEXT,
    genre TEXT,
    year INTEGER,
    rating INTEGER,
    duration INTEGER
)`);

// GET: Retrieve all movies from the database
app.get('/api',(req,res) => {
    db.all('SELECT * FROM movies', function (err,rows) {
        if (err) {
            console.log('Cannot get the movies.');
            return res.json({error: err.message});
        }
        console.log('Get the movies successfully.')
        res.json(rows);
    })
});

// PUT: Replace the entire movie collection
app.put('/api', (req,res) => {
    const movies = req.body;
    
    // First delete all current entries in the table
    db.run('DELETE FROM movies', function (err) {
        if (err) {
            console.log('Cannot replace the collection.');
            return res.json({error: err.message});
        }

        // Insert new movies using a prepared statement
        const stmt = db.prepare('INSERT INTO movies (title,director,genre,year,rating,duration) VALUES (?,?,?,?,?,?)');

        movies.forEach((movie) => {
            stmt.run([movie.title, movie.director, movie.genre, movie.year, movie.rating, movie.duration]);
        });

        stmt.finalize(); // Finalize the prepared statement
        console.log('Replace collection successfully.');
        res.json({status: 'REPLACE COLLECTION SUCCESSFUL'});
    });
});

// POST: Add a new movie entry
app.post('/api', (req,res) => {
    const {title, director, genre, year, rating, duration} = req.body;

    const stmt = db.prepare('INSERT INTO movies (title,director,genre,year,rating,duration) VALUES (?,?,?,?,?,?)');

     stmt.run([title,director,genre,year,rating,duration], function(err) {
        if (err) {
            console.log('Cannot add a new movie.')
            return res.json({error: err.message});
        }
        console.log("Add a new movie successfully.");
        res.json({status: 'CREATE ENTRY SUCCESSFUL'});
     });
});

// DELETE: Remove the entire movie collection
app.delete('/api', (req,res) => {
    db.run('DELETE FROM movies', function(err) {
        if (err) {
            console.log('Cannot delete the movie collection.')
            return res.json({error: err.message});
        }
        console.log("Delete the movie collection successfully.");
        res.json({status: 'DELETE COLLECTION SUCCESSFUL'});
    });
});

// GET: Retrieve a single movie by its ID
app.get('/api/:id', (req,res) => {
    const {id} = req.params;
    db.get('SELECT * FROM movies WHERE id = ?', [id], function(err,row) {
        if (err) {
            console.log('Cannot get the movie.');
            return res.json({error: err.message});
        }
        console.log('Get the movie successfully.');
        res.json(row);
    });
});

// PUT: Update an existing movie by ID
app.put('/api/:id', (req,res) => {
    const {title, director, genre, year, rating, duration} = req.body;
    const {id} = req.params;
    db.run('UPDATE movies SET title = ?, director = ?, genre = ?, year = ?, rating = ?, duration = ? WHERE id = ?',[title, director, genre, year, rating, duration, id], function (err) {
        if (err) {   
            console.log('Cannot update the movie.');
            return res.json({error: err.message});
        }
        console.log("Update the movie successfully.");
        res.json({status: 'UPDATE ITEM SUCCESSFUL'});
    });
});

// DELETE: Remove a single movie by ID
app.delete('/api/:id', (req,res) => {
    const {id} = req.params;
    db.run('DELETE FROM movies WHERE id = ?', [id], function (err) {
        if (err) {
            console.log('Cannot delete the movie.');
            return res.json({error: err.message});
        }
        console.log("Delete the movie successfully.");
        res.json({status: 'DELETE ITEM SUCCESSFUL'});
    });
});

// Start the Express server on port 3001
app.listen(3001, () => {
    console.log('Server running on http://localhost:3001');
})