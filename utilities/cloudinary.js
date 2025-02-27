import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"
cloudinary.config({ 
  cloud_name: 'da3kjrjip', 
  api_key: '515872288397519', 
  api_secret: '068Il2Zn6uqPiFKv81UJyKzwSNQ' // Click 'View API Keys' above to copy your API secret
});

export const cloudinaryUploader = async(file)=>{
    try {
   
   let responce = await   cloudinary.uploader.upload(file,{
    resource_type: "auto",
    secure: true
   });

    fs.unlinkSync(file, (err) => {
    if (err) {
      console.error(`Error deleting local file: ${err}`);
    } 
  
  });
  return responce
    } catch (error) {
       fs.unlinkSync(file);
       console.log("error in cloudinary :"+error);
       return null 
       
    }
}