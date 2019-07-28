/* eslint-disable strict */
const express = require('express');
const logger = require('../logger');
const path = require('path');
const folderRouter = express.Router();
const bodyParser = express.json();
const FolderService = require('./folder-service');
const xss = require('xss');

folderRouter
  .route('/folder')
  .get((req, res)=>{
    FolderService.getFolders(req.app.get('db'))
      .then(folders =>{
        return res.json(folders);
      });
  })
  .post(bodyParser,(req, res)=>{
    const { folder_name } = req.body;
    if(folder_name == null){
      return res.status(400).json({error: {message: 'Missing field in request body'}});
    }
    FolderService.addFolder(req.app.get('db'), {folder_name})
      .then(folder => {
        return res
          .status(201)
          .location(path.posix.join(req.originalUrl +`/${folder.id}`))
          .json({folder})});
  });
folderRouter
  .route('/folder/:id')
  .all((req, res, next)=>{
    FolderService.getFolderById(req.app.get('db'), req.params.id)
      .then(folder => {
        if(!folder){
          return res.status(404).json({error: {message: 'folder does not exist'}});
        }
        res.folder = folder;
        next();
      }
      );
  })
  .get((req, res)=>{
    return res.json({
      id: res.folder.id,
      folder_name: res.folder.folder_name
    });
  })
  .delete(bodyParser,(req, res)=>{
    FolderService.deleteFolder(req.app.get('db'), req.params.id)
      .then( ()=>{
        return res.status(204).end();
      });
  })
  .patch(bodyParser,(req, res)=>{
    const { folder_name } = req.body;
/*     const numOfValues = Object.values(updateName).filter(Boolean).length;
 */    if(!folder_name){
      return res.status(400).json({
        error: { message: 'Request body must contain folder_name'}
      });
    } FolderService.updateFolder(req.app.get('db'), req.params.id, {folder_name})
      .then(()=>{
        return res.status(204).end();
      });
  });

module.exports = folderRouter;