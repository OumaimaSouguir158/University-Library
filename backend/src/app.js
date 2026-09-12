require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const app     = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth',         require('./routes/auth'));
app.use('/api/books',        require('./routes/books'));
app.use('/api/reservations', require('./routes/reservations'));

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'bibliotheque-api' }));

// Gestionnaire d'erreurs global
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erreur interne du serveur' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀  API démarrée sur http://localhost:${PORT}`));
module.exports = app;
