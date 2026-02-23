'use strict';

import Comment from './comment.model.js';
import Post from '../posts/post.model.js';

// Crear comentario en una publicación
export const createComment = async (req, res) => {
    try {
        const { postId } = req.params;
        const { content } = req.body;

        // Verificar que la publicación exista
        const post = await Post.findOne({ _id: postId, isActive: true });
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Publicación no encontrada'
            });
        }

        const comment = new Comment({
            content,
            author: req.user.id,
            post: postId,
            parentComment: null
        });

        await comment.save();
        await comment.populate('author', 'name username');

        res.status(201).json({
            success: true,
            message: 'Comentario creado exitosamente',
            data: comment
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al crear el comentario',
            error: error.message
        });
    }
};

// Responder a un comentario (re-comentario)
export const replyToComment = async (req, res) => {
    try {
        const { postId, commentId } = req.params;
        const { content } = req.body;

        // Verificar publicación
        const post = await Post.findOne({ _id: postId, isActive: true });
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Publicación no encontrada'
            });
        }

        // Verificar que el comentario padre exista y pertenezca a esa publicación
        const parentComment = await Comment.findOne({
            _id: commentId,
            post: postId,
            isActive: true
        });

        if (!parentComment) {
            return res.status(404).json({
                success: false,
                message: 'Comentario no encontrado'
            });
        }

        const reply = new Comment({
            content,
            author: req.user.id,
            post: postId,
            parentComment: commentId
        });

        await reply.save();
        await reply.populate('author', 'name username');
        await reply.populate('parentComment');

        res.status(201).json({
            success: true,
            message: 'Respuesta creada exitosamente',
            data: reply
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al responder el comentario',
            error: error.message
        });
    }
};

// Obtener comentarios de una publicación (con sus respuestas)
export const getCommentsByPost = async (req, res) => {
    try {
        const { postId } = req.params;

        const post = await Post.findOne({ _id: postId, isActive: true });
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Publicación no encontrada'
            });
        }

        // Obtener comentarios principales (sin parentComment)
        const comments = await Comment.find({
            post: postId,
            parentComment: null,
            isActive: true
        })
            .populate('author', 'name username')
            .sort({ createdAt: -1 });

        // Para cada comentario, obtener sus respuestas
        const commentsWithReplies = await Promise.all(
            comments.map(async (comment) => {
                const replies = await Comment.find({
                    parentComment: comment._id,
                    isActive: true
                })
                    .populate('author', 'name username')
                    .sort({ createdAt: 1 });

                return {
                    ...comment.toObject(),
                    replies
                };
            })
        );

        res.status(200).json({
            success: true,
            data: commentsWithReplies,
            total: commentsWithReplies.length
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener los comentarios',
            error: error.message
        });
    }
};

// Editar comentario (solo el autor)
export const updateComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { content } = req.body;

        const comment = await Comment.findOne({ _id: commentId, isActive: true });

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Comentario no encontrado'
            });
        }

        if (comment.author.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para editar este comentario'
            });
        }

        comment.content = content;
        await comment.save();
        await comment.populate('author', 'name username');

        res.status(200).json({
            success: true,
            message: 'Comentario actualizado exitosamente',
            data: comment
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al actualizar el comentario',
            error: error.message
        });
    }
};

// Eliminar comentario (solo el autor)
export const deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;

        const comment = await Comment.findOne({ _id: commentId, isActive: true });

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Comentario no encontrado'
            });
        }

        if (comment.author.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para eliminar este comentario'
            });
        }

        // Soft delete (también elimina las respuestas)
        comment.isActive = false;
        await comment.save();

        // Eliminar respuestas del comentario
        await Comment.updateMany(
            { parentComment: commentId },
            { isActive: false }
        );

        res.status(200).json({
            success: true,
            message: 'Comentario eliminado exitosamente'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al eliminar el comentario',
            error: error.message
        });
    }
};