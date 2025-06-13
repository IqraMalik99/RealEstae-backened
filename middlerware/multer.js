import multer from "multer"

const folder = './api/public/temp';
if (!fs.existsSync(folder)) {
  fs.mkdirSync(folder, { recursive: true });
}

const storage = multer.diskStorage({
 
    destination: function (req, file, cb) {

      cb(null, folder)
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)

    }
  })
  
 export const upload = multer({ storage: storage })
