import {app} from './app.js'
import { mongoConnection } from './db/mongoConnection.js'
mongoConnection().then(()=>{
    app.listen(4000,()=>{
        console.log(`Server is running on port 4000`)
    })
}).catch((error)=>{
console.log(`Cannot make connection in mongodb ${error}`)
})

app.get('/', (req, res) => {
    res.send('Welcome to the MERN Backend!');
  });