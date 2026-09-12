const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const pool   = require('../config/database');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { email, password, name, role = 'student' } = req.body;
  if (!email || !password || !name)
    return res.status(400).json({ error: 'email, password et name sont requis' });
  if (!['admin','librarian','student'].includes(role))
    return res.status(400).json({ error: 'Rôle invalide' });
  try {
    const hash = await bcrypt.hash(password, 10);
    const r = await pool.query(
      'INSERT INTO users(email,password_hash,role,name) VALUES($1,$2,$3,$4) RETURNING id,email,role,name',
      [email, hash, role, name]);
    res.status(201).json(r.rows[0]);
  } catch(e) {
    if (e.code === '23505') return res.status(409).json({ error: 'Email déjà utilisé' });
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email et password requis' });
  try {
    const r = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
    const user = r.rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash)))
      return res.status(401).json({ error: 'Identifiants incorrects' });
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
    res.json({ token, user: { id: user.id, email: user.email, role: user.role, name: user.name } });
  } catch { res.status(500).json({ error: 'Erreur serveur' }); }
});

module.exports = router;
