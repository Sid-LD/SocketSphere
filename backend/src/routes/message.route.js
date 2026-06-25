import express from 'express'
import {getUserforSideBar} from "../controllers/message.controller.js";
import { protectRoute } from '../middlewares/auth.middleware.js';
import { getConversationsForSidebar } from "../controllers/message.controller.js";
import { getMessages } from '../controllers/message.controller.js';
import { sendMessage } from '../controllers/message.controller.js';
import { upload } from '../middlewares/upload.middleware.js';



const router = express.Router();

// /api/auth/check


router.get('/users', protectRoute, getUserforSideBar)
router.get("/conversations", protectRoute, getConversationsForSidebar);
router.get('/:id', protectRoute, getMessages);
router.post('/send/:id', protectRoute,upload.single('media'), sendMessage)
// in the frontend we will keep the id name as media

export default router