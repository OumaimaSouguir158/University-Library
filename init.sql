-- ── Schéma de la bibliothèque ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'student', -- admin | librarian | student
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS books (
  id SERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  author VARCHAR(255) NOT NULL,
  isbn VARCHAR(20) UNIQUE,
  genre VARCHAR(100),
  year INTEGER,
  available_copies INTEGER DEFAULT 1,
  total_copies INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reservations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'pending', -- pending | confirmed | returned | cancelled
  reserved_at TIMESTAMP DEFAULT NOW(),
  due_date TIMESTAMP,
  returned_at TIMESTAMP
);

-- ── Données de démo ──────────────────────────────────────────────────────────

INSERT INTO books (title, author, isbn, genre, year, total_copies, available_copies) VALUES
  ('Clean Code', 'Robert C. Martin', '978-0132350884', 'Informatique', 2008, 3, 3),
  ('Designing Data-Intensive Applications', 'Martin Kleppmann', '978-1449373320', 'Informatique', 2017, 2, 2),
  ('The Pragmatic Programmer', 'David Thomas', '978-0135957059', 'Informatique', 2019, 1, 2),
  ('Structure and Interpretation of Computer Programs', 'Harold Abelson', '978-0262510875', 'Informatique', 1996, 1, 1);
