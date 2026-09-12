const router = require('express').Router();
const pool   = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

// POST /api/reservations — Créer une réservation (tout utilisateur connecté)
router.post('/', authenticate, async (req, res) => {
  const { book_id } = req.body;
  if (!book_id) return res.status(400).json({ error: 'book_id requis' });
  try {
    await pool.query('BEGIN');
    const bk = (await pool.query('SELECT * FROM books WHERE id=$1 FOR UPDATE', [book_id])).rows[0];
    if (!bk)              { await pool.query('ROLLBACK'); return res.status(404).json({ error: 'Livre non trouvé' }); }
    if (bk.available_copies <= 0) { await pool.query('ROLLBACK'); return res.status(409).json({ error: 'Aucun exemplaire disponible' }); }
    const due = new Date(); due.setDate(due.getDate() + 14);
    const r = await pool.query(
      'INSERT INTO reservations(user_id,book_id,status,due_date) VALUES($1,$2,$3,$4) RETURNING *',
      [req.user.id, book_id, 'confirmed', due]);
    await pool.query('UPDATE books SET available_copies=available_copies-1 WHERE id=$1', [book_id]);
    await pool.query('COMMIT');
    res.status(201).json(r.rows[0]);
  } catch { await pool.query('ROLLBACK'); res.status(500).json({ error: 'Erreur lors de la réservation' }); }
});

// GET /api/reservations/mine — Mes réservations
router.get('/mine', authenticate, async (req, res) => {
  const r = await pool.query(
    `SELECT r.*,b.title,b.author FROM reservations r JOIN books b ON r.book_id=b.id
     WHERE r.user_id=$1 ORDER BY reserved_at DESC`, [req.user.id]);
  res.json(r.rows);
});

// GET /api/reservations — Toutes les réservations (admin / librarian)
router.get('/', authenticate, authorize('admin', 'librarian'), async (_req, res) => {
  const r = await pool.query(
    `SELECT r.*,b.title,u.name user_name FROM reservations r
     JOIN books b ON r.book_id=b.id JOIN users u ON r.user_id=u.id ORDER BY reserved_at DESC`);
  res.json(r.rows);
});

// PATCH /api/reservations/:id/return — Marquer comme rendu
router.patch('/:id/return', authenticate, authorize('admin', 'librarian'), async (req, res) => {
  try {
    await pool.query('BEGIN');
    const r = await pool.query(
      "UPDATE reservations SET status='returned',returned_at=NOW() WHERE id=$1 RETURNING *", [req.params.id]);
    if (!r.rows[0]) { await pool.query('ROLLBACK'); return res.status(404).json({ error: 'Réservation non trouvée' }); }
    await pool.query('UPDATE books SET available_copies=available_copies+1 WHERE id=$1', [r.rows[0].book_id]);
    await pool.query('COMMIT');
    res.json(r.rows[0]);
  } catch { await pool.query('ROLLBACK'); res.status(500).json({ error: 'Erreur' }); }
});

module.exports = router;
