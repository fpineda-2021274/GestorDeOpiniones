'use strict';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { dbConnection } from './db.js';


// Rutas
import authRoutes from '../src/auth/auth.routes.js';
import postRoutes from '../src/posts/post.routes.js';
import commentRoutes from '../src/comments/comment.routes.js';

const BASE_PATH = '/api/v1';

const middlewares = (app) => {
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: false, limit: '10mb' }));
    app.use(cors());
    app.use(helmet());
    app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));
};

const routes = (app) => {
    app.use(`${BASE_PATH}/auth`, authRoutes);
    app.use(`${BASE_PATH}/posts`, postRoutes);
    app.use(`${BASE_PATH}/comments`, commentRoutes);

    // Health check
    app.get(`${BASE_PATH}/health`, (req, res) => {
        res.status(200).json({
            status: 'Healthy',
            timestamp: new Date().toISOString(),
            service: 'Facebook Opinion System'
        });
    });

    // 404
    app.use((req, res) => {
        res.status(404).json({
            success: false,
            message: `Ruta ${req.originalUrl} no encontrada`
        });
    });
};

const errorHandler = (app) => {
    app.use((err, req, res, next) => {
        console.error(err.stack);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: err.message
        });
    });
};

export const initServer = async () => {
    const app = express();
    const PORT = process.env.PORT || 3005;

    try {
        await dbConnection();
        middlewares(app);
        routes(app);
        errorHandler(app);

        app.listen(PORT, () => {
            console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
            console.log(`📋 Health check: http://localhost:${PORT}${BASE_PATH}/health`);
            console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
        });

    } catch (error) {
        console.error(`❌ Error al iniciar el servidor: ${error.message}`);
        process.exit(1);
    }
};