-- Weftmap full schema for Turso/libSQL.
-- Each statement is on a single line so web SQL editors can't truncate them.
-- Run top to bottom. The DROPs reset any partial/malformed state (FK order: children first).

DROP TABLE IF EXISTS testimonial;
DROP TABLE IF EXISTS graph;
DROP TABLE IF EXISTS verificationToken;
DROP TABLE IF EXISTS session;
DROP TABLE IF EXISTS account;
DROP TABLE IF EXISTS user;

CREATE TABLE user (id text PRIMARY KEY NOT NULL, name text, email text, emailVerified integer, image text);
CREATE UNIQUE INDEX user_email_unique ON user (email);
CREATE TABLE account (userId text NOT NULL, type text NOT NULL, provider text NOT NULL, providerAccountId text NOT NULL, refresh_token text, access_token text, expires_at integer, token_type text, scope text, id_token text, session_state text, PRIMARY KEY(provider, providerAccountId), FOREIGN KEY (userId) REFERENCES user(id) ON DELETE cascade);
CREATE TABLE session (sessionToken text PRIMARY KEY NOT NULL, userId text NOT NULL, expires integer NOT NULL, FOREIGN KEY (userId) REFERENCES user(id) ON DELETE cascade);
CREATE TABLE verificationToken (identifier text NOT NULL, token text NOT NULL, expires integer NOT NULL, PRIMARY KEY(identifier, token));
CREATE TABLE graph (id text PRIMARY KEY NOT NULL, userId text NOT NULL, title text NOT NULL, language text NOT NULL, source text NOT NULL, graph text NOT NULL, createdAt integer NOT NULL, FOREIGN KEY (userId) REFERENCES user(id) ON DELETE cascade);
CREATE TABLE testimonial (id text PRIMARY KEY NOT NULL, userId text NOT NULL, body text NOT NULL, createdAt integer NOT NULL, FOREIGN KEY (userId) REFERENCES user(id) ON DELETE cascade);
