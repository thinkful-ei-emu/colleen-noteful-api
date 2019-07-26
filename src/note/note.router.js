/* eslint-disable strict */
const express = require('express');
const logger = require('../logger');
const path = require('path');
const noteRouter = express.Router();
const bodyParser = express.json();
const NoteService = require('../note-service');
const xss = require('xss');

noteRouter
  .route('/note')
  .get((req,res)=>{
    NoteService.getNotes(req.app.get('db'))
      .then(notes =>
        res.json(notes));
  })
  .post(bodyParser,(req, res)=>{
    const { note_name, note_content, folder} = req.body;
    const newNote = { note_name, note_content, folder};
    for(const[key, value] of Object.entries(newNote)){
      // eslint-disable-next-line eqeqeq
      if (value == null){
        return res
          .status(400)
          .json({error: {message: `Missing ${key} in request body`}});
      }
    }

    NoteService.addNote(req.app.get('db'), newNote)
      .then(note=>{
        res
          .status(201)
          .location(path.posix.join(req.originalUrl+`/${note.id}`))
          .json({note});
        logger.info(`Note with id ${note.id} created`);
      });
      
  });
noteRouter
  .route('/note/:id')
  .all((req,res,next)=>{
    NoteService.getNoteById(req.app.get('db'), req.params.id)
      .then(note => {
        if(!note){
          logger.error(`note with id ${req.params.id} not found`);
          return res.status(404).json({
            error: {message: 'note does not exist'}
          });
        }
        res.note = note;
        next();
      })
      .catch(next);
  })
  .get((req, res)=>{
    res.json({
      id: res.note.id,
      note_name: res.note.note_name,
      note_content: res.note.note_content,
      modified: res.note.modified,
      folder: res.note.folder
    });
    
  })
  .delete((req,res)=>{
    NoteService.deleteNote(req.app.get('db'), req.params.id)
      .then(()=>{
        return res.status(204).end();
      });
  })
  .patch(bodyParser,(req, res)=>{
    const { note_name, note_content, folder} = req.body;
    const updatedInfo = { note_name, note_content, folder};
    const numOfValues = Object.values(updatedInfo).filter(Boolean).length;
    if(numOfValues ===0){
      return res.status(400).json({
        error: { message: 'Request body must contain note_name, note_content, or folder'}
      });
    }
    NoteService.updateNote(req.app.get('db'), req.params.id, updatedInfo)
      .then(()=>{
        return res.status(204).end();
      });
  });

module.exports = noteRouter;