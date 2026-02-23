'use strict';

import mongoose from 'mongoose';

const commentSchema = mongoose.Schema({
    content: {
        type: String,
        required: [true, 'El contenido del comentario es requerido'],
        trim: true,
        maxLength: [1000, 'El comentario no puede exceder 1000 caracteres']
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    },
    // Si es null, es un comentario principal. Si tiene valor, es respuesta a otro comentario.
    parentComment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    versionKey: false
});

commentSchema.index({ post: 1 });
commentSchema.index({ author: 1 });
commentSchema.index({ parentComment: 1 });

export default mongoose.model('Comment', commentSchema);