import mongoose, { Schema } from "mongoose";

let ListSchema = new Schema({
    name:{
        type:String,
        required:true
    },
    detail:{
        type:String,
        required:true
    },
    address:{
        type:String,
        required:true
    },
    Bath:{
        type:String,
        required:true
    },
    Beds:{
        type:String,
        required:true
    },
    furnished:{
        type:Boolean,
        default:false
    },
    offer:{
        type:Boolean,
        default:false
    },
    parking:{
        type:Boolean,
        default:false
    },
    rent:{
        type:Boolean,
        default:false
    },
    sell:{
        type:Boolean,
        default:false
    },
    imageUrl:{
        type:Array
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',  // Referencing the 'User' schema
        required: true
    },
    amount:{
        type:String
    }

},{timestamps:true})
export let List = mongoose.model("List",ListSchema);