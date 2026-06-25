//Multer converts the uploaded file into a JavaScript object (req.file), and ImageKit uploads that file to the cloud and returns a URL.

import multer from 'multer'

const MAX_FILE_SIZE=25*1024*1024// 25 Mb

export const upload=multer({
    storage:multer.memoryStorage(),
    limits:MAX_FILE_SIZE,
    fileFilter:(req, res, cb)=>{
        const isImage=file.mimetype.startsWith('image/')
        const isVideo=file.mimetype.startsWith('video/')

        if(!isImage && !isVideo){
            cb(new Error('Only uploading image and videos are allowed'));
            return;
        }
        cb(null, true)

    },
})