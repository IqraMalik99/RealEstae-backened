

import { app } from "./app.js";
import { mongoConnection } from "./db/mongoConnection.js";


app.get("/",(req,res,next)=>{
    res.send("Iqra Malikg");
})

mongoConnection().then(()=>{
    app.listen(4000,()=>{
        console.log(" My server is running on port 4000");
    })
}).catch((error)=>{
    console.log(`Cannot make connection  mongodb ${error}`)
    })