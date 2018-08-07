var mongoose = require('mongoose');
var Conversation = mongoose.model('Conversation');
var Message = mongoose.model('Message');
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
						const conversation = new Conversation({
						    participants: [req.user._id, req.params.recipient]
						});

						conversation.save(function(err, newConversation) {
						    if (err) {
						      	response.error = true;
						        response.code = 500;
						        response.userMessage = 'Error Occured';
						        response.data = null
						        response.errors = null;
						        console.log('err',response)
						        socket.emit('msg_err',response)
						    }

						    const message = new Message({
						      conversationId: newConversation._id,
						      body: req.body.composedMessage,
						      author: req.user._id
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
						      		response.error = false;
							        response.code = 200;
							        response.userMessage = 'Conversation started!';
							        response.data = {
							        	conversationId: conversation._id
							        };
							        response.errors = null;
							        console.log('response',response)
							        socket.emit('msg_success',response)
							    }
						    });
						});
					}
					else{
						const reply = new Message({
						    conversationId: req.params.conversationId,
						    body: req.body.composedMessage,
						    author: req.user._id
						});

						reply.save(function(err, sentReply) {
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
						    	response.error = false;
						        response.code = 200;
						        response.userMessage = 'Reply successfully sent!';
						        response.data = null
						        response.errors = null;
						        console.log('response',response)
						        socket.emit('msg_success',response)
							}
						});
					}
				}
			})
		})
	})
}