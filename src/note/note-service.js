/* eslint-disable strict */
const noteService = {
  getNotes(knex){
    return knex
      .select('*')
      .from('note');
  },
  getNoteById(knex, id){
    return knex
      .select('*')
      .from('note')
      .where('id', id)
      .first();
  },
  addNote(knex, newNote){
    return knex
      .returning('*')
      .insert(newNote)
      .into('note')
      .then(rows=>rows[0]);
  },
  deleteNote(knex, id){
    console.log(id);
    return knex
      .from('note')
      .where('id', id)
      .delete();

  },
  updateNote(knex, id, updatedInfo){
    return knex
      .from('note')
      .where('id', id)
      .update(updatedInfo);
  }
};
module.exports = noteService;