TRUNCATE folder, note RESTART IDENTITY CASCADE:

INSERT INTO folder (folder_name)
VALUES
('Folder 1'),
('Folder 2'),
('Folder 3');

INSERT INTO note (note_name, note_content, folder)
VALUES
('Note 1', 'note 1 content', '1'),
('Note 2', 'note 2 content', '1'),
('Note 3', 'note 3 content', '2'),
('Note 4', 'note 4 content', '2'),
('Note 5', 'note 5 content', '3'),
('Note 6', 'note 6 content', '3');

