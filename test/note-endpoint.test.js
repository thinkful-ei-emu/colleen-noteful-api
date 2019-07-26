/* eslint-disable strict */
process.env.TZ = 'UTC';
require('dotenv').config();
const {expect}=require('chai');
const knex=require('knex');
const app=require('../src/app');

const { makeNoteList } = require('./note.fixture.js');
const { makeFolders } = require('./folder.fixture.js');


describe('Note Endpoints', function() {
  let db;
  before('make knex instance', ()=>{
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL
    });
    app.set('db', db);
    return db;
  });
  before('clean table', ()=>db.raw('TRUNCATE note, folder RESTART IDENTITY CASCADE'));
  after('disconnect from db', ()=>db.destroy());
  afterEach('clean up', ()=>db.raw('TRUNCATE note, folder RESTART IDENTITY CASCADE'));

  describe('GET /api/note', ()=>{
    context('Given there are notes in db', ()=>{
      const testFolders = makeFolders();
      const testNotes = makeNoteList();
      beforeEach('clean up', ()=>db.raw('TRUNCATE note, folder RESTART IDENTITY CASCADE'));
      beforeEach('insert folder', ()=>{
        return db.insert(testFolders).into('folder')
          .then(()=>{
            return db.insert(testNotes).into('note');
          });
      });
      afterEach('clean up', ()=>db.raw('TRUNCATE note, folder RESTART IDENTITY CASCADE'));

      it('responds 200 with notes', ()=> {
        return supertest(app)
          .get('/api/note')
          .expect(200, testNotes);
      });
    
    });
    context('Given there are no notes in db', ()=>{
      const testFolders= makeFolders();
      beforeEach('insert folder', ()=>{
        return db.insert(testFolders).into('folder');
      });
      it('responds 200 with empty array', ()=>{
        return supertest(app)
          .get('/api/note')
          .expect(200)
          .then(res=>{
            expect(res.body).to.eql([]);
          });
      });
    });
  });
  describe('GET /api/note/:noteid', ()=>{
    context('given there are notes in the db', ()=>{
      const testList = makeNoteList();
      const testFolders = makeFolders();
      beforeEach('add notes and folders',()=>{
        return db.insert(testFolders).into('folder')
          .then(()=>{
            return db.insert(testList).into('note');
          });
      });
      it('responds 200 with note of given ID', ()=>{
        const testId=2;
        const expectedNote = testList[testId-1];
        return supertest(app)
          .get(`/api/note/${testId}`)
          .expect(200, expectedNote);
      });
    });
    context('given the note does not exist', ()=>{
      it('responds 404 with error message',()=>{
        return supertest(app)
          .get('/api/note/1')
          .expect(404, {error: {message: 'note does not exist'}});
      });
    });

  });
  describe('POST /note', ()=>{
    context('given the folder exists',()=>{
      const testFolders = makeFolders();
      beforeEach('add folders to db',()=>{
        return db.insert(testFolders).into('folder');
      });
      it('responds 201 and with the new note', ()=>{
        const newNote = {
          note_name: 'new note',
          note_content: 'new note content',
          folder: 2
        };
        return supertest(app)
          .post('/api/note')
          .send(newNote)
          .expect(201)
          .expect(res=>{
            expect(res.headers.location).to.eql(`/api/note/${res.body.note.id}`);
          });
      });
      const requiredFields = ['note_name', 'note_content', 'folder'];
      requiredFields.forEach(field => {
        const newNote = {
          note_name: 'new note',
          note_content: 'new content',
          folder: '1'
        };
        it('responds with 400 and error message if field is missing', ()=>{
          delete newNote[field];
          return supertest(app)
            .post('/api/note')
            .send(newNote)
            .expect(400, {
              error: {message: `Missing ${field} in request body`}
            });
        });});
     
    });

  });
  describe('DELETE /note:id', ()=>{
    context('if notes in db', ()=>{
      const testFolders = makeFolders();
      const testList = makeNoteList();
      beforeEach('add notes and folders',()=>{
        return db.insert(testFolders).into('folder')
          .then(()=>{
            return db.insert(testList).into('note');
          });
      });
      it('responds with 204 and deletes note of id',()=>{
        const testId = 2;
        const expectedNotes = testList.filter(note => note.id !== testId);
        return supertest(app)
          .delete(`/api/note/${testId}`)
          .expect(204)
          .then(()=>{
            return supertest(app)
              .get('/api/note')
              .expect(expectedNotes);
          });
      });
    });
    context('if note not in db', ()=>{
      it('responds with a 404 and error', ()=>{
        return supertest(app)
          .delete('/api/note/1')
          .expect(404, {error: {message: 'note does not exist'}});
      });
    });
  });
  describe.only('PATCH /api/note/:noteId', ()=>{
    context('given note exists', ()=>{
      const testFolders = makeFolders();
      const testList = makeNoteList();
      beforeEach('add notes and folders',()=>{
        return db.insert(testFolders).into('folder')
          .then(()=>{
            return db.insert(testList).into('note');
          });
      });
      it('updates note with given information', ()=>{
        const idUpdate = 2;
        const updateThis = {
          note_name: 'note updated'
        };
        const expectedNote = {
          ...testList[idUpdate -1],
          ...updateThis
        }
        return supertest(app)
        .patch('/api/note/2')
        .send(updateThis)
        .expect(204)
        .then(res=>{
          return supertest(app)
          .get('/api/note/2')
          .expect(expectedNote)
        });
      });
      it("responds with 204 when updating only a subset of fields", () => {
        const idToUpdate = 2;
        const updateNote = {
          note_name: 'new title'
        };
        const expectedNote = {
          ...testList[idToUpdate - 1],
          ...updateNote
        };
        return supertest(app)
          .patch(`/api/note/${idToUpdate}`)
          .send({
            ...updateNote,
            fieldToIgnore: "should not be included in GET"
          })
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/note/${idToUpdate}`)
              .expect(expectedNote)
          );
      });
      it('responds with 400 if no updated data given', ()=>{
        return supertest(app)
        .patch('/api/note/2')
        .send({bad: 'fa'})
        .expect(400, {error: {message: 'Request body must contain note_name, note_content, or folder'}})
      })
    });
  })
});