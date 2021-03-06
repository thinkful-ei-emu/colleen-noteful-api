# Noteful API

Acts as the API for the noteful app, where notes can be created and organized into folders

Endpoints: 
/folder/:folderId--displays one folder and list of notes inside
/note/:noteId--displays one note and its content
/note--displays all notes, not organized by folder

table-- referred to as singular noun folder and note


## migration of data:
psql -U dunder-mifflin -d noteful -f ./migrations/001.do.create_noteful.sql 

psql -U dunder-mifflin -d noteful -f ./migrations/001.undo.create_noteful.sql 


## Set up

Complete the following steps to start a new project (NEW-PROJECT-NAME):

1. Clone this repository to your local machine `git clone BOILERPLATE-URL NEW-PROJECTS-NAME`
2. `cd` into the cloned repository
3. Make a fresh start of the git history for this project with `rm -rf .git && git init`
4. Install the node dependencies `npm install`
5. Move the example Environment file to `.env` that will be ignored by git and read by the express server `mv example.env .env`
6. Edit the contents of the `package.json` to use NEW-PROJECT-NAME instead of `"name": "express-boilerplate",`

## Scripts

Start the application `npm start`

Start nodemon for the application `npm run dev`

Run the tests `npm test`

## Deploying

When your new project is ready for deployment, add a new Heroku application with `heroku create`. This will make a new git remote called "heroku" and you can then `npm run deploy` which will push to this remote's master branch.
