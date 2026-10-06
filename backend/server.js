const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Setup CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Setup Multer for file uploads (max 10MB)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Setup data file
const dataFile = path.join(__dirname, 'data.json');
if (!fs.existsSync(dataFile)) {
  fs.writeFileSync(dataFile, JSON.stringify([]));
}

// Payment Submission Route
app.post('/api/submit-payment', upload.single('screenshot'), (req, res) => {
  try {
    const { paymentMethod, transactionId, transactionDate, amount, teamName } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'Payment screenshot is required.' });
    }

    const newPayment = {
      id: Date.now().toString(),
      teamName: teamName || 'Unknown Team',
      paymentMethod,
      transactionId,
      transactionDate,
      amount,
      screenshotPath: file.filename,
      submittedAt: new Date().toISOString()
    };

    // Save to data.json
    const data = JSON.parse(fs.readFileSync(dataFile));
    data.push(newPayment);
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));

    res.status(200).json({ message: 'Payment details submitted successfully!', paymentId: newPayment.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while processing the payment.' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
