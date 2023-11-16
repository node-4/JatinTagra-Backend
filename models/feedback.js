const mongoose = require('mongoose');
const schema = mongoose.Schema;
const FeedbackSchema = new mongoose.Schema({
    userId: {
        type: schema.Types.ObjectId,
        ref: "user"
    },
    Feedback: {
        type: String
    },
    rating: {
        type: Number,
        max: [5, 'too many arguments']
    },

},
    { timestamps: true });

module.exports = mongoose.model('feedback', FeedbackSchema);