require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = 'your_jwt_secret'; 

app.use(bodyParser.json());


// Registration route
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Please enter all fields' });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
        username,
        password: hashedPassword,
    });

    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
});

// Login route
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Please enter all fields' });
    }

    const user = await User.findOne({ username });
    if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
});

// Save QR code route
app.post('/save-qrcode', async (req, res) => {
    const { token, text, image } = req.body;

    if (!token || !text) {
        return res.status(400).json({ message: 'Please provide all required fields' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const newQRCode = new QRCode({
            userId: decoded.id,
            text,
            image
        });

        await newQRCode.save();
        res.status(201).json({ message: 'QR code saved successfully' });
    } catch (error) {
        res.status(400).json({ message: 'Invalid token' });
    }
});

// Get QR codes route
app.get('/qrcodes', async (req, res) => {
    const { token } = req.query;

    if (!token) {
        return res.status(400).json({ message: 'Token is required' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const qrCodes = await QRCode.find({ userId: decoded.id }).sort({ createdAt: -1 }).limit(10);
        res.json(qrCodes);
    } catch (error) {
        res.status(400).json({ message: 'Invalid token' });
    }
});


app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});
app.get('/app', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.get('/recent-qr', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'recent-qr.html'));
});
app.use(express.static(path.join(__dirname, 'public')));
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);
const qrCodeSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    image: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const QRCode = mongoose.model('QRCode', qrCodeSchema);
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});