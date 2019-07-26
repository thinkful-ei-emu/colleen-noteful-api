/* eslint-disable strict */
function makeNoteList (){
  return [
    {
      id: 1,
      note_name: 'note 1',
      note_content: 'content of note 1',
      modified: '2029-01-22T16:28:32.615Z',
      folder: 1
    },
    {
      id: 2,
      note_name: 'note 2',
      note_content: 'content of note 3',
      modified: '2029-01-22T16:28:32.615Z',
      folder: 1
    },
    {
      id: 3,
      note_name: 'note 3',
      note_content: 'content of note 3',
      modified: '2029-01-22T16:28:32.615Z',
      folder: 2
    },
    {
      id: 4,
      note_name: 'note 4',
      note_content: 'content of note 4',
      modified: '2029-01-22T16:28:32.615Z',
      folder: 2
    }
  ];
}
module.exports = { makeNoteList };