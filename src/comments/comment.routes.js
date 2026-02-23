'use strict';

import { Router } from 'express';
import {
    createComment,
    replyToComment,
    getCommentsByPost,
    updateComment,
    deleteComment
} from './comment.controller.js';
import { verifyToken } from '../../middlewares/auth.middleware.js';

const router = Router();

// Comentarios de una publicación
router.get('/post/:postId', verifyToken, getCommentsByPost);

// Crear comentario en una publicación
router.post('/post/:postId', verifyToken, createComment);

// Responder a un comentario (re-comentario)
router.post('/post/:postId/reply/:commentId', verifyToken, replyToComment);

// Editar comentario
router.put('/:commentId', verifyToken, updateComment);

// Eliminar comentario
router.delete('/:commentId', verifyToken, deleteComment);

export default router;