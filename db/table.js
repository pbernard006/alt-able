const mongoose = require("mongoose");

const TableSchema = new mongoose.Schema({
  numero: {
    type: Number,
    required: true
  },
  convive: {
    type: Number,
    required: true
  }
});

const Table = mongoose.model("table", TableSchema);

module.exports = Table;