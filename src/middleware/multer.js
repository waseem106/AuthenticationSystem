// import multer from 'multer'



// const storage=multer.diskStorage({
    
//     destination:(req,file,cb)=>{
//         cb(null,'./uploads')
//     },
//     filename:(req,file,cb)=>{
//         const uniqueName=`${Date.now()}-${file.originalname}`;
//         cb(null,uniqueName)
//     }
    
// });

// export const upload =multer({storage:storage})


import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "user_profiles", // Change folder name as needed
    format: async (req, file) => "png", // Auto convert to PNG
    public_id: (req, file) => `${Date.now()}-${file.originalname}`,
  },
});

export const upload = multer({ storage: storage });
