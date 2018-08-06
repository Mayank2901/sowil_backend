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
			if(data.new_message){
				const conversation = new Conversation({
				    participants: [req.user._id, req.params.recipient]
				});

				conversation.save(function(err, newConversation) {
				    if (err) {
				      res.send({ error: err });
				      return next(err);
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
					        return SendResponse(res, 500);
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
					        return SendResponse(res, 200);
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
				        return SendResponse(res, 500);
				    }
				    else{
				    	response.error = false;
				        response.code = 200;
				        response.userMessage = 'Reply successfully sent!';
				        response.data = null
				        response.errors = null;
				        console.log('response',response)
				        return SendResponse(res, 200);
					}
				});
			}
		});

	})
}