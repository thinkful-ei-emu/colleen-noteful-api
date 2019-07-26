--remove foreign key constraint from notes to folders
ALTER TABLE IF EXISTS note
DROP COLUMN folder;

--DROP tables
DROP TABLE IF EXISTS note;
DROP TABLE IF EXISTS folder;