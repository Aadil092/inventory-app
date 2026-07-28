import mongoose from "mongoose";

const citySchema =  new mongoose.Schema({
    name : { type: String , required: true},
     stateId: {type: mongoose.Schema.Types.ObjectId, ref: "State", required: true},
});

const CityModel = mongoose.model("City", citySchema);

export default CityModel;