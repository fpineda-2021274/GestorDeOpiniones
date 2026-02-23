'use strict';

import { Router } from 'express';
import {
    createPost,
    getPosts,
    getPostById,
    updatePost,
    deletePost
} from './post.controller.js';
import { verifyToken } from '../../middlewares/auth.middleware.js';

const router = Router();

// Todas las rutas requieren autenticación
router.get('/', verifyToken, getPosts);
router.get('/:id', verifyToken, getPostById);
router.post('/', verifyToken, createPost);
router.put('/:id', verifyToken, updatePost);
router.delete('/:id', verifyToken, deletePost);

export default router;