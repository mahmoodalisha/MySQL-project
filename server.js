const express = require('express');
const mysql = require('mysql2');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const cors = require('cors');
const dotenv = require('dotenv');
const app = express();
const jwt = require('jsonwebtoken');
const authenticateToken = require('./authenticateToken');

dotenv.config();

app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
    host: 'localhost',  
    user: 'root',       
    password: '1234',       
    database: 'user_app',  
});

pool.getConnection((err, connection) => {
    if (err) {
        console.error('Error connecting to MySQL:', err.stack);
        return;
    }
    console.log('Connected to MySQL as id ' + connection.threadId);
    connection.release();  
});


app.get('/test', (req, res) => {
    pool.query('SELECT 1 + 1 AS result', (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ result: results[0].result });
    });
}); 

const sendVerificationCode = (email, verificationCode) => {
    return new Promise((resolve, reject) => {
        // Use Ethereal for local email testing
        nodemailer.createTestAccount().then((testAccount) => {
            const transporter = nodemailer.createTransport({
                host: 'smtp.ethereal.email',
                port: 587,
                secure: false, // true for 465, false for other ports
                auth: {
                    user: testAccount.user, // Generated ethereal user
                    pass: testAccount.pass, // Generated ethereal password
                },
            });

            // Compose email content
            const mailOptions = {
                to: email,
                from: testAccount.user,
                subject: 'Your Verification Code',
                text: `You are receiving this email because you requested a verification code. Your verification code is: ${verificationCode}`,
            };

            // Send the email
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return reject(error); // Reject the promise on error
                }

                // Log the preview URL for Ethereal testing
                const previewUrl = nodemailer.getTestMessageUrl(info);
                console.log('Preview URL:', previewUrl);
                
                // Resolve the promise with the preview URL
                resolve({ previewUrl, info });
            });
        }).catch((err) => reject(err)); // Handle any errors from creating the test account
    });
};

const loginUser = (req, res) => {
    const { email } = req.body; // Only email is required for login

    // Check if the user exists in the database
    pool.execute('SELECT * FROM users WHERE email = ?', [email], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        if (result.length === 0) {
            return res.status(400).json({ error: 'User not found' }); // User doesn't exist
        }

        const user = result[0]; // Get the user object from the result

        // Generate a 4-digit verification code
        const verificationCode = crypto.randomInt(1000, 9999).toString();

        // Send the verification code to the user's email
        sendVerificationCode(email, verificationCode)
            .then(({ previewUrl }) => {
                // Generate JWT for the user
                const token = jwt.sign(
                    { userId: user.id }, // Payload (user ID)
                    process.env.JWT_SECRET, // Secret key from environment variables
                    { expiresIn: '1h' } // Token expiration time
                );

                // Optionally store the verification code temporarily for validation (in DB or cache)
                res.status(200).json({
                    message: 'Login successful. Please check your email for the verification code.',
                    previewUrl, // Include the preview URL here
                    token, // Send the token to the client
                });
            })
            .catch((error) => {
                console.error('Error sending verification code:', error);
                res.status(500).json({ error: 'Failed to send verification code' });
            });
    });
};


app.post('/login', loginUser);
  

const registerUser = (req, res) => {
    const { email, phone_number, first_name, last_name } = req.body;

    // Check if the email already exists in the database
    pool.execute('SELECT * FROM users WHERE email = ?', [email], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        if (result.length > 0) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        // Generate a 4-digit verification code
        const verificationCode = crypto.randomInt(1000, 9999).toString();

        // Save the user to the database
        pool.execute(
            'INSERT INTO users (email, phone_number, first_name, last_name) VALUES (?, ?, ?, ?)',
            [email, phone_number, first_name, last_name],
            (err, result) => {
                if (err) {
                    return res.status(500).json({ error: 'Failed to register user' });
                }

                // Send the verification code to the user's email
                sendVerificationCode(email, verificationCode)
                    .then(({ previewUrl }) => {
                        // Optionally store the verification code temporarily for validation (in DB or cache)
                        res.status(200).json({
                            message: 'Registration successful. Please check your email for the verification code.',
                            previewUrl,  // Include the preview URL here
                        });
                    })
                    .catch((error) => {
                        console.error('Error sending verification code:', error);
                        res.status(500).json({ error: 'Failed to send verification code' });
                    });
            }
        );
    });
};


app.post('/register', registerUser); 





app.get('/data', (req, res) => {
    const query = `
        SELECT 
            t.id AS topic_id, 
            t.name AS topic_name, 
            st.id AS subtopic_id, 
            st.name AS subtopic_name, 
            q.id AS question_id, 
            q.question AS question_text, 
            qo.id AS option_id, 
            qo.option_text AS option_text, 
            qo.score AS option_score
        FROM 
            topics t
        LEFT JOIN 
            subtopics st ON t.id = st.topic_id
        LEFT JOIN 
            questions q ON st.id = q.subtopic_id
        LEFT JOIN 
            question_options qo ON q.id = qo.question_id
        ORDER BY 
            t.id, st.id, q.id, qo.id;
    `;

    pool.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        
        const data = {};
        results.forEach(row => {
            
            if (!data[row.topic_id]) {
                data[row.topic_id] = {
                    topic_id: row.topic_id,
                    topic_name: row.topic_name,
                    subtopics: {}
                };
            }

            
            if (row.subtopic_id && !data[row.topic_id].subtopics[row.subtopic_id]) {
                data[row.topic_id].subtopics[row.subtopic_id] = {
                    subtopic_id: row.subtopic_id,
                    subtopic_name: row.subtopic_name,
                    questions: {}
                };
            }

            
            if (row.question_id && !data[row.topic_id].subtopics[row.subtopic_id].questions[row.question_id]) {
                data[row.topic_id].subtopics[row.subtopic_id].questions[row.question_id] = {
                    question_id: row.question_id,
                    question_text: row.question_text,
                    options: []
                };
            }

            
            if (row.option_id) {
                data[row.topic_id].subtopics[row.subtopic_id].questions[row.question_id].options.push({
                    option_id: row.option_id,
                    option_text: row.option_text,
                    option_score: row.option_score
                });
            }
        });

        
        const response = Object.values(data).map(topic => {
            topic.subtopics = Object.values(topic.subtopics).map(subtopic => {
                subtopic.questions = Object.values(subtopic.questions);
                return subtopic;
            });
            return topic;
        });

        res.json(response);
    });
});

app.post('/save-result', authenticateToken, (req, res) => {
    const { question_id, selected_option_id, score } = req.body;
    const userId = req.user.userId; // Extract user ID from token

    const query = `
      INSERT INTO results (user_id, question_id, selected_option_id, score) 
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        selected_option_id = ?, score = ?;
    `;
    const values = [userId, question_id, selected_option_id, score, selected_option_id, score];

    pool.query(query, values, (err, result) => {
        if (err) {
            console.error('Error inserting/updating result:', err);
            return res.status(500).send('Error saving result');
        }

        res.status(200).send('Result saved successfully');
    });
});

  
  app.get('/get-user-score/:user_id', (req, res) => {
    const userId = req.params.user_id;
  
    // Retrieve the total score for the user
    const query = `
      SELECT SUM(score) AS totalScore 
      FROM results 
      WHERE user_id = ?;
    `;
  
    pool.query(query, [userId], (err, result) => {
      if (err) {
        console.error('Error retrieving score:', err);
        return res.status(500).send('Error retrieving score');
      }
  
      if (result.length === 0) {
        return res.status(400).send('No results found for this user');
      }
  
      res.status(200).json({
        totalScore: result[0].totalScore || 0, 
      });
    });
  });
  


const port = 5000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
