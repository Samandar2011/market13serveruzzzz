-- Production PostgreSQL schema reference. Replace the local JSON adapter in server.js with a DB repository before deployment.
CREATE TABLE roles (id UUID PRIMARY KEY, name TEXT UNIQUE NOT NULL);
CREATE TABLE users (id UUID PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, phone TEXT UNIQUE, region TEXT, password_hash TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'active', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE user_roles (user_id UUID REFERENCES users(id), role_id UUID REFERENCES roles(id), PRIMARY KEY(user_id,role_id));
CREATE TABLE tests (id UUID PRIMARY KEY, title TEXT NOT NULL, category TEXT, description TEXT, duration_minutes INT, price NUMERIC(12,2), status TEXT, access_type TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE test_sections (id UUID PRIMARY KEY, test_id UUID REFERENCES tests(id) ON DELETE CASCADE, module TEXT, position INT);
CREATE TABLE questions (id UUID PRIMARY KEY, section_id UUID REFERENCES test_sections(id) ON DELETE CASCADE, type TEXT, prompt TEXT, points NUMERIC, payload JSONB, position INT);
CREATE TABLE question_options (id UUID PRIMARY KEY, question_id UUID REFERENCES questions(id) ON DELETE CASCADE, body TEXT, is_correct BOOLEAN, position INT);
CREATE TABLE test_attempts (id UUID PRIMARY KEY, user_id UUID REFERENCES users(id), test_id UUID REFERENCES tests(id), status TEXT, score NUMERIC, started_at TIMESTAMPTZ, completed_at TIMESTAMPTZ);
CREATE TABLE test_answers (id UUID PRIMARY KEY, attempt_id UUID REFERENCES test_attempts(id) ON DELETE CASCADE, question_id UUID REFERENCES questions(id), answer JSONB, score NUMERIC);
CREATE TABLE evaluations (id UUID PRIMARY KEY, attempt_id UUID REFERENCES test_attempts(id), question_id UUID REFERENCES questions(id), examiner_id UUID REFERENCES users(id), rubric JSONB, score NUMERIC, feedback TEXT);
CREATE TABLE certificates (id UUID PRIMARY KEY, attempt_id UUID REFERENCES test_attempts(id), code TEXT UNIQUE, issued_at TIMESTAMPTZ DEFAULT now());
