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
    user: 'sql12733751',
    password: 'pxcg8iIsjA',
    database: 'sql12733751'
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
app.get('/subject',(req, res) => {
    const sql = "SELECT * FROM subjects";
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
app.get('/subject/:id', (req, res) => {
    const subject_code = req.params.id; 
    const sql = "SELECT * FROM subjects WHERE subject_code = ?";
    db.query(sql, [subject_code], (err, data) => {
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
app.get('/account/student/:id', (req, res) => {
    const student_id = req.params.id; 
    const sql = "SELECT * FROM account WHERE student_id = ? and role = 'student'";
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
app.get('/grade/subject/:id', (req, res) => {
    const grade_id = req.params.id; 
    const sql = "SELECT * FROM grades WHERE grade_id = ?";
    db.query(sql, [grade_id], (err, data) => {
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
app.get('/grade/:id', (req, res) => {
    const student_id = req.params.id; 
    const sql = `
        SELECT g.grade_id, g.student_id, g.subject_code, g.grade, s.subject_name
        FROM grades g
        INNER JOIN subjects s ON g.subject_code = s.subject_code
        WHERE g.student_id = ?
    `;
    
    db.query(sql, [student_id], (err, data) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }

        if (data.length === 0) {
            return res.status(404).json({ message: 'No grades found for this student' });
        }

        res.json(data); 
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
app.post('/grade/create/:id', (req, res) => {
    const student_id = req.params.id;
    const sql = "insert into grades (student_id, subject_code, grade) values (?)";
    const values = [student_id, req.body.subject_code, req.body.grade];
    db.query(sql, [values], (err, data) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }
        res.json({data,  message: 'Student created successfully'});
    })
});
app.post('/subject/create', (req, res) => {
    const sql = "insert into subjects (subject_code, subject_name, lecturer) values (?)";
    const values = [req.body.subject_code, req.body.subject_name, req.body.lecturer];
    db.query(sql, [values], (err, data) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }
        res.json({data,  message: 'Subject created successfully'});
    })
});
app.post('/account/student/create', (req, res) => {
    const sql = "insert into account (student_id, username, password, role) values (?)";
    const values = [req.body.student_id, req.body.username, req.body.password, 'student'];
    db.query(sql, [values], (err, data) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }
        res.json({data,  message: 'account created successfully'});
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
app.put('/subject/update/:id', (req, res) => { 
    const sql = `
        UPDATE subjects 
        SET subject_code = ?, 
            subject_name = ?, 
            lecturer = ?, 
        WHERE subject_code = ?
    `;
    const values = [
        req.body.student_code, 
        req.body.subject_name, 
        req.body.lecturer, 
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
app.put('/grade/subject/:id', (req, res) => {
    const sql = `
        UPDATE grades 
        SET grade = ?, 
            subject_code = ?
        WHERE grade_id = ?
    `;
    const values = [
        req.body.grade, 
        req.body.subject_code, 
        parseInt(req.params.id) 
    ];
    
    db.query(sql, values, (err, data) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }
        res.json({ data, message: 'Grade updated successfully' });
    });
});
app.put('/account/student/update/:id', (req, res) => { 
    const sql = `
        UPDATE account 
        SET student_id = ?, 
            username = ?, 
            password = ?
        WHERE student_id = ?
    `;
    const values = [
        req.body.student_id, 
        req.body.username, 
        req.body.password, 
        req.params.id  
    ];
    
    db.query(sql, values, (err, data) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }
        res.json({ data, message: 'account updated successfully' });
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
app.delete('/subject/:id', (req, res) => {
    const sql = "DELETE FROM subjects WHERE subject_code = ?";
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
app.delete('/account/student/:id', (req, res) => {
    const sql = "DELETE FROM account WHERE student_id = ?";
    const values = [req.params.id];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.json({ message: 'account deleted successfully' });
    });
});
app.delete('/grade/subject/:id', (req, res) => {
    const sql = "DELETE FROM grades WHERE grade_id = ?";
    const values = [req.params.id];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.json({ message: 'account deleted successfully' });
    });
});
app.listen(8081, () => {
    console.log('Server is running on port 8081');
});
