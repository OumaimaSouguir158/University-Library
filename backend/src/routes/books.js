const router = require('express').Router();
const pool   = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/books — Recherche multicritère
router.get('/', async (req, res) => {
  const { title, author, genre, available } = req.query;
  const params = [], conditions = ['1=1'];
  if (title)  { params.push(`%${title}%`);  conditions.push(`title  ILIKE $${params.length}`); }
  if (author) { params.push(`%${author}%`); conditions.push(`author ILIKE $${params.length}`); }
  if (genre)  { params.push(`%${genre}%`);  conditions.push(`genre  ILIKE $${params.length}`); }
  if (available === 'true') conditions.push('available_copies > 0');
  try {
    const r = await pool.query(`SELECT * FROM books WHERE ${conditions.join(' AND ')} ORDER BY title`, params);
    res.json(r.rows);
  } catch { res.status(500).json({ error: 'Erreur lors de la recherche' }); }
});

// GET /api/books/:id
router.get('/:id', async (req, res) => {
  const r = await pool.query('SELECT * FROM books WHERE id=$1', [req.params.id]);
  r.rows[0] ? res.json(r.rows[0]) : res.status(404).json({ error: 'Livre introuvable' });
});

// POST /api/books — admin ou librarian
router.post('/', authenticate, authorize('admin', 'librarian'), async (req, res) => {
  const { title, author, isbn, genre, year, total_copies = 1 } = req.body;
  if (!title || !author) return res.status(400).json({ error: 'title et author sont requis' });
  const r = await pool.query(
    'INSERT INTO books(title,author,isbn,genre,year,total_copies,available_copies) VALUES($1,$2,$3,$4,$5,$6,$6) RETURNING *',
    [title, author, isbn, genre, year, total_copies]);
  res.status(201).json(r.rows[0]);
});

// PUT /api/books/:id — admin ou librarian
router.put('/:id', authenticate, authorize('admin', 'librarian'), async (req, res) => {
  const { title, author, genre, year } = req.body;
  const r = await pool.query(
    'UPDATE books SET title=$1,author=$2,genre=$3,year=$4 WHERE id=$5 RETURNING *',
    [title, author, genre, year, req.params.id]);
  r.rows[0] ? res.json(r.rows[0]) : res.status(404).json({ error: 'Livre introuvable' });
});

// DELETE /api/books/:id — admin uniquement
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  await pool.query('DELETE FROM books WHERE id=$1', [req.params.id]);
  res.status(204).send();
});

module.exports = router;
