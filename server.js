const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const FILE = 'games.json';
const PORT = 3000;

// GET o'yinlarni olish
app.get('/games', (req, res) => {
  fs.readFile(FILE, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Ma’lumot o‘qishda xato' });
    const games = JSON.parse(data || '[]');
    res.json(games);
  });
});

// POST yangi o'yin qo'shish
app.post('/games', (req, res) => {
  const newGame = req.body;
  if (!newGame.opponent || !newGame.result || !newGame.opening) {
    return res.status(400).json({ error: 'Iltimos, opponent, result va openingni to‘liq kiriting' });
  }

  fs.readFile(FILE, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Ma’lumot o‘qishda xato' });
    const games = JSON.parse(data || '[]');
    newGame.id = games.length ? games[games.length - 1].id + 1 : 1;
    games.push(newGame);
    fs.writeFile(FILE, JSON.stringify(games, null, 2), err => {
      if (err) return res.status(500).json({ error: 'Ma’lumot yozishda xato' });
      res.status(201).json(newGame);
    });
  });
});

// DELETE o'yinni o'chirish
app.delete('/games/:id', (req, res) => {
  const id = parseInt(req.params.id);
  fs.readFile(FILE, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Ma’lumot o‘qishda xato' });
    let games = JSON.parse(data || '[]');
    const initialLength = games.length;
    games = games.filter(game => game.id !== id);
    if (games.length === initialLength) {
      return res.status(404).json({ error: 'Partiya topilmadi' });
    }
    fs.writeFile(FILE, JSON.stringify(games, null, 2), err => {
      if (err) return res.status(500).json({ error: 'Ma’lumot yozishda xato' });
      res.json({ message: 'Partiya o‘chirildi' });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server ${PORT} portda ishlayapti...`);
});
