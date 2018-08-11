var mongoose = require('mongoose');
var Conversation = mongoose.model('Conversation');
var Message = mongoose.model('Message');
var redis = require("../redis")
var User = mongoose.model('User');

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

module.exports = function(io) {
	io.on('connection', function(socket){
		console.log("connected")
		socket.emit('pong', {"data": "ping"})
		socket.on('message', function(data){
			console.log('data',data)
			redis.get(data.token, function (err, reply) {
		    	if(err){
					console.log('err:',err)
					response.error = true;
					response.code = 500;
					response.userMessage = "There was a problem with the request, please try again."
					response.data = null
					response.errors = err
					socket.emit('auth_err',response)
				}
				else{
					if(data.new_message){
						User
						.findOne({username:data.recipient})
						.select('_id username')
						.lean()
						.exec(function(err,user){
							if(err){
								console.log('err:',err)
								response.error = true;
						        response.code = 500;
						        response.userMessage = 'Error Occured';
						        response.data = null
						        response.errors = null;
						        console.log('err',response)
						        io.socket.emit('msg_err',response);
							}
							else{
								console.log('chat user',data,user,data._id)
								Conversation.find({ participants: {$all: [data._id,user._id]} })
								.exec(function(err, conversations) {
								    console.log('data',err,conversations)
								    if (err) {
								      	response.error = true;
								        response.code = 500;
								        response.userMessage = 'Error Occured';
								        response.data = null
								        response.errors = null;
								        console.log('err',response)
								        io.socket.emit('msg_err',response)
								    }
								    else if(conversations){
								    	const reply2 = new Message({
										    conversationId: conversations[0]._id,
										    body: data.composedMessage,
										    author: data._id,
										    read: false
										});

										reply2.save(function(err, sentReply) {
										    if (err) {
										    	response.error = true;
										        response.code = 500;
										        response.userMessage = 'Error Occured';
										        response.data = null
										        response.errors = null;
										        console.log('err',response)
										        socket.emit('msg_err',response)
										    }
										    else{
										    	var reply = sentReply.toJSON();
										    	reply.recipient = user._id
										    	response.error = false;
										        response.code = 200;
										        response.userMessage = 'Reply successfully sent!';
										        response.data = reply
										        response.errors = null;
										        console.log('response',response,sentReply)
										        io.sockets.emit('msg_recieved',response)
											}
										});
								    }
								    else{
								    	const conversation = new Conversation({
										    participants: [data._id, user._id]
										});

										conversation.save(function(err, newConversation) {
										    if (err) {
										      	response.error = true;
										        response.code = 500;
										        response.userMessage = 'Error Occured';
										        response.data = null
										        response.errors = null;
										        console.log('err',response)
										        io.socket.emit('msg_err',response)
										    }

										    const message = new Message({
										      conversationId: newConversation._id,
										      body: data.composedMessage,
										      author: data._id,
										      read: false
										    });

										    message.save(function(err, newMessage) {
										      	if (err) {
										        	response.error = true;
											        response.code = 500;
											        response.userMessage = 'Error Occured';
											        response.data = null
											        response.errors = null;
											        console.log('err',response)
											        socket.emit('msg_err',response)
										      	}
										      	else{
										      		//var msg = newMessage.toJSON();
										      		//msg.
										      		response.error = false;
											        response.code = 200;
											        response.userMessage = 'Conversation started!';
											        response.data = {
											        	conversationId: conversation._id,
											        	message : newMessage,
											        	user : user
											        };
											        response.errors = null;
											        console.log('response',response)
											        io.socket.emit('msg_recieved',response)
											    }
										    });
										});
								    }
								});
							}
						});
					}
					else{
						const reply2 = new Message({
						    conversationId: data.conversationId,
						    body: data.composedMessage,
						    author: reply,
						    read: false
						});

						reply2.save(function(err, sentReply) {
						    if (err) {
						    	response.error = true;
						        response.code = 500;
						        response.userMessage = 'Error Occured';
						        response.data = null
						        response.errors = null;
						        console.log('err',response)
						        socket.emit('msg_err',response)
						    }
						    else{
						    	var reply = sentReply.toJSON();
						    	reply.recipient = data.recipient
						    	response.error = false;
						        response.code = 200;
						        response.userMessage = 'Reply successfully sent!';
						        response.data = reply
						        response.errors = null;
						        console.log('response',response,sentReply)
						        io.sockets.emit('msg_recieved',response)
							}
						});
					}
				}
			})
		})
	})
}