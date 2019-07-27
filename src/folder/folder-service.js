/* eslint-disable strict */
const folderService = {
  getFolders(knex){
    return knex
      .select('*')
      .from('folder');
  },
  getFolderById(knex, id){
    return knex
      .select('*')
      .from('folder')
      .where('id', id)
      .first();
  },
  addFolder(knex, newFolder){
    return knex
      .returning('*')
      .insert(newFolder)
      .into('folder')
      .then(rows=>rows[0]);
  },
  deleteFolder(knex, id){
    return knex
      .from('folder')
      .where('id', id)
      .delete();
  },
  updateFolder(knex, id, updatedInfo){
    return knex
      .from('folder')
      .where('id', id)
      .update(updatedInfo);
  }
};
module.exports = folderService;