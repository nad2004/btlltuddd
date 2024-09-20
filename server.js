import express from 'express';
import cors from 'cors';
import mysql from 'mysql2';
import jwt from 'jsonwebtoken';

const app = express();
app.use(express.json());
app.use(cors());

const JWT_SECRET = 'NAD';
const db = mysql.createConnection({
    host: 'sql12.freemysqlhosting.net',
    user: 'sql12732241',
    password: 'D7hQL6LuQD',
    database: 'sql12732241'
});


const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(403).json({ message: 'Token is required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }

        req.user = user;
        next();
    });
};


app.get('/protected', authenticateJWT, (req, res) => {
    res.json({ message: `Welcome, user ID: ${req.user.id}` });
});


app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    const sql = "SELECT * FROM account WHERE username = ? AND password = ?";
    db.query(sql, [username, password], (err, data) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }

        if (data.length > 0) {
            const user = { id: data[0].ID }; 
            const token = jwt.sign(user, JWT_SECRET, { expiresIn: '5m' }); 
            res.json({ login: true, token, data });
        } else {
            res.json({ login: false, message: 'Invalid username or password' });
        }
    });
});

app.get('/student',(req, res) => {
    const sql = "SELECT * FROM students";
    db.query(sql, (err, data) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }
        res.json(data);
    });
})
app.get('/account/student',(req, res) => {
    const sql = "SELECT * FROM account where role = 'student'";
    db.query(sql, (err, data) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }
        res.json(data);
    });
})
app.get('/student/:id', (req, res) => {
    const student_id = req.params.id; 
    const sql = "SELECT * FROM students WHERE student_id = ?";
    db.query(sql, [student_id], (err, data) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }

        if (data.length === 0) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.json(data[0]); 
    });
});
app.post('/student/create', (req, res) => {
    const sql = "insert into students (student_id, name, date, class, major, email, phone, address) values (?)";
    const values = [req.body.student_id, req.body.name, req.body.date, req.body.class, req.body.major, req.body.email, req.body.phone, req.body.address];
    db.query(sql, [values], (err, data) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }
        res.json({data,  message: 'Student created successfully'});
    })
});

app.put('/student/update/:id', (req, res) => { 
    const sql = `
        UPDATE students 
        SET student_id = ?, 
            name = ?, 
            date = ?, 
            class = ?, 
            major = ?, 
            email = ?, 
            phone = ?, 
            address = ? 
        WHERE student_id = ?
    `;
    const values = [
        req.body.student_id, 
        req.body.name, 
        req.body.date, 
        req.body.class, 
        req.body.major, 
        req.body.email, 
        req.body.phone, 
        req.body.address, 
        req.params.id  
    ];
    
    db.query(sql, values, (err, data) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }
        res.json({ data, message: 'Student updated successfully' });
    });
});
app.delete('/student/:id', (req, res) => {
    const sql = "DELETE FROM students WHERE student_id = ?";
    const values = [req.params.id];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.json({ message: 'Student deleted successfully' });
    });
});
app.listen(8081, () => {
    console.log('Server is running on port 8081');
});
