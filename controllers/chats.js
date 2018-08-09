var mongoose = require('mongoose');
var Conversation = mongoose.model('Conversation');
var Message = mongoose.model('Message');
var session = require('./../libs/session');
var async = require("async");

var response = {
  error: false,
  code: "",
  data: null,
  userMessage: '',
  errors: null
};

var NullResponseValue = function() {
  response = {
    error: false,
    code: "",
    data: null,
    userMessage: '',
    errors: null
  };
  return true;
};
var SendResponse = function(res, status) {
  res.status(status || 200).send(response);
  NullResponseValue();
};

var methods = {};
/*
Routings/controller goes here
*/
module.exports.controller = function(router) {

	router.route('/chats')
    .get(session.checkToken,methods.getchats)

  router.route('/chat/:chat_id')
    .get(session.checkToken,methods.getchat)

}

/*==============================================
***   method to get user chats  ***
================================================*/
methods.getchats = function(req, res) {
  
  Conversation.find({ participants: req.user._id })
  .populate({ path: 'participants', select: 'username' })
  .exec(function(err, conversations) {
    console.log('data',err,conversations,conversations[0].participants)
    if (err) {
      res.send({ error: err });
      return next(err);
    }
    // Set up empty array to hold conversations + most recent message
    let fullConversations = [];
    async.each(conversations, (conversation, callback) => {
      Message.find({ 'conversationId': conversation._id })
      .sort('-createdAt')
      .limit(1)
      .lean()
      .populate('author',{username:true})
      .exec(function(err, message) {
        console.log('message',err,message)
        if (err) {
          response.error = true;
          response.code = 500;
          response.userMessage = 'Error Occured';
          response.data = null
          response.errors = err;
          console.log('err',response)
          return callback(response);
        }
        else{
          message[0].conversation = conversation
          fullConversations.push(message);
          if(fullConversations.length === conversations.length) {
            response.error = false;
            response.code = 200;
            response.userMessage = 'Conversations';
            console.log('fullConversations',fullConversations)
            response.data = { conversations: fullConversations }
            response.errors = null;
            console.log('response',response)
            // return callback(response);
            return SendResponse(res, 200);
          }
        }
      });
    }, function(err) {
      // if any of the file processing produced an error, err would equal that error
      if( err ) {
        return SendResponse(res, 500);
      } 
    });
  })
};
/*********************
  Ends
*********************/

/*==============================================
***   method to get particular user chat  ***
================================================*/
methods.getchat = function(req, res) {
  
  Message.find({ conversationId: req.params.chat_id })
  .select('createdAt body author')
  .sort('-createdAt')
  .populate({
    path: 'author',
    select: 'profile.firstName profile.lastName'
  })
  .exec(function(err, messages) {
    if (err) {
      response.error = true;
      response.code = 500;
      response.userMessage = 'Error Occured';
      response.data = null
      response.errors = err;
      console.log('err',response)
      return SendResponse(res, 500);
    }
    else{
      response.error = false;
      response.code = 200;
      response.userMessage = 'Conversation';
      response.data = { conversations: messages }
      response.errors = null;
      console.log('response',response)
      return SendResponse(res, 200);
    }
  });

};
/*********************
  Ends
*********************/
