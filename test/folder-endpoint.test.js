/* eslint-disable strict */
process.env.TZ = 'UTC';
require('dotenv').config();
const {expect}=require('chai');
const knex=require('knex');
const app=require('../src/app');

const { makeNoteList } = require('./note.fixture.js');
const { makeFolders } = require('./folder.fixture.js');


describe('Folder Endpoints', function() {
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

  describe('GET /api/folder', ()=>{
    context('Given there are folders in db', ()=>{
      const testFolders = makeFolders();
      const testList = makeNoteList();

      beforeEach('clean up', ()=>db.raw('TRUNCATE folder, note RESTART IDENTITY CASCADE'));
      beforeEach('add notes and folders',()=>{
        return db.insert(testFolders).into('folder')
          .then(()=>{
            return db.insert(testList).into('note');
          });
      });
      afterEach('clean up', ()=>db.raw('TRUNCATE folder, note RESTART IDENTITY CASCADE'));

      it('responds 200 with folders', ()=> {
        return supertest(app)
          .get('/api/folder')
          .expect(200)
          .then(res=>{
            expect(res.body).to.eql(testFolders);
      });
    
    });
    context('Given there are no folders in db', ()=>{
      beforeEach('clean up', ()=>db.raw('TRUNCATE folder, note RESTART IDENTITY CASCADE'));
      afterEach('clean up', ()=>db.raw('TRUNCATE folder, note RESTART IDENTITY CASCADE'));

      it('responds 200 with empty array', ()=>{
        return supertest(app)
          .get('/api/folder')
          .expect(200)
          .then(res=>{
            expect(res.body).to.eql([]);
          });
      });
    });
  });
  describe('GET /api/folder/:folderid', ()=>{
    context('given there are folders in the db', ()=>{
      const testList = makeNoteList();
      const testFolders = makeFolders();
      beforeEach('clean up', ()=>db.raw('TRUNCATE folder, note RESTART IDENTITY CASCADE'));

      beforeEach('add notes and folders',()=>{
        return db.insert(testFolders).into('folder')
          .then(()=>{
            return db.insert(testList).into('note');
          });
      });
      afterEach('clean up', ()=>db.raw('TRUNCATE folder, note RESTART IDENTITY CASCADE'));

      it('responds 200 with folder of given ID', ()=>{
        const testId=2;
        const expectedFolder = testFolders[testId-1];
        return supertest(app)
          .get(`/api/folder/${testId}`)
          .expect(200, expectedFolder);
      });
    });
    context('given the folder does not exist', ()=>{
      it('responds 404 with error message',()=>{
        return supertest(app)
          .get('/api/folder/1')
          .expect(404, {error: {message: 'folder does not exist'}});
      });
    });

  });
  describe('POST /folder', ()=>{
    context('given the folder exists',()=>{
      beforeEach('clean up', ()=>db.raw('TRUNCATE folder RESTART IDENTITY CASCADE'));

      const testFolders = makeFolders();
      beforeEach('add folders to db',()=>{
        return db.insert(testFolders).into('folder');
      });
      afterEach('clean up', ()=>db.raw('TRUNCATE folder RESTART IDENTITY CASCADE'));

      it('responds 201 and with the new folder', ()=>{
        const newFolder = {
          folder_name: 'new folder',
        };
        return supertest(app)
          .post('/api/folder')
          .send(newFolder)
          .expect(201)
          .expect(res=>{
            expect(res.headers.location).to.eql(`/api/folder/${res.body.folder.id}`);
          });
      });
      const requiredFields = ['folder_name'];
      requiredFields.forEach(field => {
        const newFolder = {
          folder_name: 'new folder',
        };
        it('responds with 400 and error message if field is missing', ()=>{
          delete newFolder[field];
          return supertest(app)
            .post('/api/folder')
            .send(newFolder)
            .expect(400, {
              error: {message: `Missing ${field} in request body`}
            });
        });});
     
    });

  });
  describe('DELETE /folder:id', ()=>{
    context('if folders in db', ()=>{
      const testFolders = makeFolders();
      const testList = makeNoteList();
      beforeEach('add notes and folders',()=>{
        return db.insert(testFolders).into('folder')
          .then(()=>{
            return db.insert(testList).into('note');
          });
      });
      afterEach('clean up', ()=>db.raw('TRUNCATE folder, note RESTART IDENTITY CASCADE'));

      it('responds with 204 and deletes folder of id',()=>{
        const testId = 2;
        const expectedFolders = testFolders.filter(folder => folder.id !== testId);
        return supertest(app)
          .delete(`/api/folder/${testId}`)
          .expect(204)
          .then(()=>{
            return supertest(app)
              .get('/api/folder')
              .expect(expectedFolders);
          });
      });
    });
    context('if folder not in db', ()=>{
      it('responds with a 404 and error', ()=>{
        return supertest(app)
          .delete('/api/folder/1')
          .expect(404, {error: {message: 'folder does not exist'}});
      });
    });
  });
  describe('PATCH /api/folder/:folderId', ()=>{
    context('given folder exists', ()=>{
      const testFolders = makeFolders();
      const testList = makeNoteList();
      beforeEach('add notes and folders',()=>{
        return db.insert(testFolders).into('folder')
          .then(()=>{
            return db.insert(testList).into('note');
          });
      });
      afterEach('clean up', ()=>db.raw('TRUNCATE folder, note RESTART IDENTITY CASCADE'));

      it('updates folder with given information', ()=>{
        const idUpdate = 2;
        const updateThis = {
          folder_name: 'folder name updated'
        };
        const expectedFolder = {
          ...testFolders[idUpdate -1],
          ...updateThis
        }
        return supertest(app)
        .patch('/api/folder/2')
        .send(updateThis)
        .expect(204)
        .then(res=>{
          return supertest(app)
          .get('/api/folder/2')
          .expect(expectedFolder)
        });
      });
      it("responds with 204 when updating only a subset of fields", () => {
        const idToUpdate = 2;
        const updateFolder = {
          folder_name: 'new title'
        };
        const expectedFolder = {
          ...testList[idToUpdate - 1],
          ...updateFolder
        };
        return supertest(app)
          .patch(`/api/folder/${idToUpdate}`)
          .send({
            ...updateFolder,
            fieldToIgnore: "should not be included in GET"
          })
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/folder/${idToUpdate}`)
              .expect(expectedFolder)
          );
      });
      it('responds with 400 if no updated data given', ()=>{
        return supertest(app)
        .patch('/api/folder/2')
        .send({bad: 'fa'})
        .expect(400, {error: {message: 'Request body must contain folder_name'}})
      })
    });
  });
});
});