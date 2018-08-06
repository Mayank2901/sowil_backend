var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var crypto = require('crypto');

var ConversationSchema = new Schema({  
  participants: [{ type: Schema.Types.ObjectId, ref: 'User'}],
});

mongoose.model('Conversation', ConversationSchema);

var MessageSchema = new Schema({  
  conversationId: {
    type: Schema.Types.ObjectId,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
},
{
  timestamps: true // Saves createdAt and updatedAt as dates. createdAt will be our timestamp.
});

mongoose.model('Message', MessageSchema);