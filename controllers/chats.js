var mongoose = require('mongoose');
var Conversation = mongoose.model('Conversation');
var Message = mongoose.model('Message');
var session = require('./../libs/session');

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
  .select('_id')
  .exec(function(err, conversations) {
    if (err) {
      res.send({ error: err });
      return next(err);
    }

    // Set up empty array to hold conversations + most recent message
    let fullConversations = [];
    conversations.forEach(function(conversation) {
      Message.find({ 'conversationId': conversation._id })
      .sort('-createdAt')
      .limit(1)
      .populate('user',{username:true})
      .exec(function(err, message) {
        if (err) {
          response.error = true;
          response.code = 500;
          response.userMessage = 'Error Occured';
          response.data = null
          response.errors = err;
          console.log('err',response)
          return SendResponse(res, 500);
        }
        fullConversations.push(message);
        if(fullConversations.length === conversations.length) {
          response.error = false;
          response.code = 200;
          response.userMessage = 'Conversations';
          response.data = { conversations: fullConversations }
          response.errors = null;
          console.log('response',response)
          return SendResponse(res, 200);
        }
      });
    });
  });

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
