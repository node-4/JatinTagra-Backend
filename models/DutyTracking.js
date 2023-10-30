const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DutyTrackingSchema = new Schema({
  driverId: {
    type: Schema.Types.ObjectId,
    ref: "user"
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date
  },
  image: {
    type: String
  }
});

module.exports = mongoose.model("DutyTracking", DutyTrackingSchema);
