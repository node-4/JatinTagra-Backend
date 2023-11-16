const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
    videoLink: {
        type: String,
        required: true,
    },
    image: {
        type: String,
    },
    description: {
        type: String,
    },
});

const Video = mongoose.model('Video', videoSchema);

module.exports = Video;
