# Building a RESTful API in Node and Express

Using the Express 4.0 Router to build node backend

## Requirements

- Node and npm

## Installation

- Clone the repo: `git clone git@github.com:Mayank2901/sowil_backend.git`
- Install dependencies: `npm install`
- Start the server: `node server.js`

## Testing the API
Test your API using [Postman](https://chrome.google.com/webstore/detail/postman-rest-client-packa/fhbjgbiflinjbdggehcddcbncdddomop)


##  How to get started!

 - run `npm start` from the home directory.
 - Listening on port 8080

 ## Approach

 - Users i.e (Doctor and patients can only be created by Admin.)
 - Admin login is username - admin and password - admin
 - Chats are created using Socket.io(socket folder)
 - User Data is stored in MongoDB(models folder)
 - Session Management is done in Redis(redis file)
 - User's and Admin Api's are inside controllers folder.
 - Session file is in Libs folder.
 - Execution starts from server.js file