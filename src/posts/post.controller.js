'use strict';

import Post from './post.model.js';

// Crear publicación
export const createPost = async (req, res) => {
    try {
        const { title, category, content } = req.body;

        const post = new Post({
            title,
            category,
            content,
            author: req.user.id
        });

        await post.save();
        await post.populate('author', 'name username');

        res.status(201).json({
            success: true,
            message: 'Publicación creada exitosamente',
            data: post
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al crear la publicación',
            error: error.message
        });
    }
};

// Obtener todas las publicaciones
export const getPosts = async (req, res) => {
    try {
        const { page = 1, limit = 10, category } = req.query;

        const filter = { isActive: true };
        if (category) filter.category = new RegExp(category, 'i');

        const posts = await Post.find(filter)
            .populate('author', 'name username')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        const total = await Post.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: posts,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
                totalItems: total,
                limit: parseInt(limit)
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener las publicaciones',
            error: error.message
        });
    }
};

// Obtener publicación por ID
export const getPostById = async (req, res) => {
    try {
        const { id } = req.params;

        const post = await Post.findOne({ _id: id, isActive: true })
            .populate('author', 'name username');

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Publicación no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            data: post
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener la publicación',
            error: error.message
        });
    }
};

// Editar publicación (solo el autor)
export const updatePost = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, category, content } = req.body;

        const post = await Post.findOne({ _id: id, isActive: true });

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Publicación no encontrada'
            });
        }

        // Solo el autor puede editar
        if (post.author.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para editar esta publicación'
            });
        }

        if (title) post.title = title;
        if (category) post.category = category;
        if (content) post.content = content;

        await post.save();
        await post.populate('author', 'name username');

        res.status(200).json({
            success: true,
            message: 'Publicación actualizada exitosamente',
            data: post
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al actualizar la publicación',
            error: error.message
        });
    }
};

// Eliminar publicación (solo el autor)
export const deletePost = async (req, res) => {
    try {
        const { id } = req.params;

        const post = await Post.findOne({ _id: id, isActive: true });

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Publicación no encontrada'
            });
        }

        // Solo el autor puede eliminar
        if (post.author.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para eliminar esta publicación'
            });
        }

        post.isActive = false;
        await post.save();

        res.status(200).json({
            success: true,
            message: 'Publicación eliminada exitosamente'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al eliminar la publicación',
            error: error.message
        });
    }
};