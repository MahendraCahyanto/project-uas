const express = require('express');
const bodyParser = require('body-parser');
const koneksi = require('./config/database');
const app = express();
const PORT = process.env.PORT || 5000;

const multer = require('multer');
const path = require('path');
const cors = require('cors');

// Set body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Enable CORS
app.use(cors({ origin: '*' }));

// Set static folder for serving images
app.use(express.static('./public'));

// Set up Multer
const storage = multer.diskStorage({
  destination: (req, file, callBack) => {
    callBack(null, './public/images/'); // Directory name where the file will be saved
  },
  filename: (req, file, callBack) => {
    callBack(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Insert data
app.post('/api/mahasiswa', upload.single('image'), (req, res) => {
  const nim = req.body.nim;
  const nama = req.body.nama;
  const tanggal_lahir = req.body.tanggal_lahir;
  const alamat = req.body.alamat;
  let foto = '';

  if (!req.file) {
    console.log('No file uploaded');
  } else {
    console.log(req.file.filename);
    const imgsrc = 'http://localhost:5000/images/' + req.file.filename;
    foto = imgsrc;
  }

  const querySql = 'INSERT INTO mahasiswa (nim, nama, tanggal_lahir, alamat, foto) VALUES (?, ?, ?, ?, ?);';
  const values = [nim, nama, tanggal_lahir, alamat, foto];

  koneksi.query(querySql, values, (err, rows, field) => {
    if (err) {
      return res.status(500).json({ message: 'Gagal insert data!', error: err });
    }

    res.status(201).json({ success: true, message: 'Berhasil insert data!' });
  });
});

// Get data
app.get('/api/mahasiswa', (req, res) => {
  const querySql = 'SELECT * FROM mahasiswa';

  koneksi.query(querySql, (err, rows, field) => {
    if (err) {
      return res.status(500).json({ message: 'Ada kesalahan', error: err });
    }

    res.status(200).json({ success: true, data: rows });
  });
});

// Update data
app.put('/api/mahasiswa/:nim', (req, res) => {
  const nim = req.params.nim;
  const nama = req.body.nama;
  const tanggal_lahir = req.body.tanggal_lahir;
  const alamat = req.body.alamat;

  const querySearch = 'SELECT * FROM mahasiswa WHERE nim = ?';
  const queryUpdate = 'UPDATE mahasiswa SET nama = ?, tanggal_lahir = ?, alamat = ? WHERE nim = ?';

  koneksi.query(querySearch, nim, (err, rows, field) => {
    if (err) {
      return res.status(500).json({ message: 'Ada kesalahan', error: err });
    }

    if (rows.length) {
      koneksi.query(queryUpdate, [nama, tanggal_lahir, alamat, nim], (err, rows, field) => {
        if (err) {
          return res.status(500).json({ message: 'Ada kesalahan', error: err });
        }

        res.status(200).json({ success: true, message: 'Berhasil update data!' });
      });
    } else {
      return res.status(404).json({ message: 'Data tidak ditemukan!', success: false });
    }
  });
});

// Delete data
app.delete('/api/mahasiswa/:nim', (req, res) => {
  const nim = req.params.nim;
  const querySearch = 'SELECT * FROM mahasiswa WHERE nim = ?';
  const queryDelete = 'DELETE FROM mahasiswa WHERE nim = ?';

  koneksi.query(querySearch, nim, (err, rows, field) => {
    if (err) {
      return res.status(500).json({ message: 'Ada kesalahan', error: err });
    }

    if (rows.length) {
      koneksi.query(queryDelete, nim, (err, rows, field) => {
        if (err) {
          return res.status(500).json({ message: 'Ada kesalahan', error: err });
        }

        res.status(200).json({ success: true, message: 'Berhasil hapus data!' });
      });
    } else {
      return res.status(404).json({ message: 'Data tidak ditemukan!', success: false });
    }
  });
});

// Start the server
app.listen(PORT, () => console.log(`Server running at port: ${PORT}`));
