const mongoose = require("mongoose");
const addressSchema = new mongoose.Schema({
  address: {
    type: String,
  },
  city: {
    type: String,
  },
  state: {
    type: String,
  },
  pinCode: {
    type: Number,
  },
  landMark: {
    type: String,
  },
  street: {
    type: String,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "user",
  },
});
module.exports = mongoose.model("Address", addressSchema);
