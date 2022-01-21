const mongoose = require("mongoose");
const TableSchema = require("./table").schema


const PlanTableSchema = new mongoose.Schema();

PlanTableSchema.add({
  name: {
    type: String,
    required: true
  },
  table: [TableSchema] 
})


const PlanTable = mongoose.model("plan table", PlanTableSchema);

module.exports = PlanTable;