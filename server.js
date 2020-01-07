const express = require('express');
const connectDB = require('./config/db');

const app = express();

// Connect to Database
connectDB();

// Init Middleware to access body of request
app.use(express.json({ extended: true }));

// Routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/posts', require('./routes/api/posts'));

app.get('/', (req, res) => {
	res.send('<h1>Working...</h1>');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
	console.log(`Server running on PORT: ${PORT}`);
});
