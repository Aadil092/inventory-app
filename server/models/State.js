import mongoose from "mongoose";

const stateSchema =  new mongoose.Schema({
    stateName : { type: String , required: true},
});

const StateModel = mongoose.model("State", stateSchema);

export default StateModel;