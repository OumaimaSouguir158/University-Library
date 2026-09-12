const jwt = require('jsonwebtoken');

/**
 * authenticate — Vérifie le JWT Bearer et injecte req.user
 */
const authenticate = (req, res, next) => {
  const token = (req.headers.authorization || '').split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token manquant' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(403).json({ error: 'Token invalide ou expiré' });
  }
};

/**
 * authorize — Restreint l'accès aux rôles spécifiés
 * Usage : authorize('admin', 'librarian')
 */
const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role))
    return res.status(403).json({ error: `Accès refusé. Rôles requis : ${roles.join(', ')}` });
  next();
};

module.exports = { authenticate, authorize };
