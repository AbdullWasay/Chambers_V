const express = require('express');
const cors = require('cors');
const { uploadResume ,getRewrittenResume} = require('./controllers/resumeController');
const upload = require('./middlewares/upload');

require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/upload', upload.single('file'), uploadResume);
app.get('/rewritten', getRewrittenResume);

// Add error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

