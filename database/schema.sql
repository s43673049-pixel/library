CREATE DATABASE library;
USE library;
CREATE TABLE  books (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  isbn VARCHAR(32) NULL,
  quantity INT NOT NULL DEFAULT 1,
  available INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_books_title ON books (title);
CREATE INDEX idx_books_author ON books (author);

-- Admin users (JWT login)
CREATE TABLE  users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_users_email (email)
);

-- Library members (not for JWT login in this version)
CREATE TABLE members (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NULL,
  phone VARCHAR(40) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_members_email (email)
);

-- Transactions: issuing and returning books
CREATE TABLE  transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  book_id INT NOT NULL,
  member_id INT NOT NULL,
  issued_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  due_date DATE NULL,
  returned_at DATETIME NULL,

  -- Who triggered the transaction (admin user)
  created_by INT NULL,

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_tx_book (book_id),
  INDEX idx_tx_member (member_id),
  INDEX idx_tx_returned_at (returned_at),
  CONSTRAINT fk_tx_book
    FOREIGN KEY (book_id) REFERENCES books(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_tx_member
    FOREIGN KEY (member_id) REFERENCES members(id)
    ON DELETE CASCADE
);

