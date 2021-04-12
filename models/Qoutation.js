const mongoose = require("mongoose");
const QouteCategory = require("./QouteCategory");

const qoutationSchema = new mongoose.Schema({
  qoutation: {
    type: String,
  },
  category: {
    type: QouteCategory.schema,
  },
});

const Qoutatuin = mongoose.model("qoutation", qoutationSchema);

module.exports = Qoutatuin;
