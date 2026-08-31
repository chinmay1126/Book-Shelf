import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import authRoutes from './routes/authRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import bookRoutes from './routes/books.js';
import readingGoalRoutes from './routes/readingGoalRoutes.js';
import stockAlertRoutes from './routes/stockAlertRoutes.js';
import priceAlertRoutes from './routes/priceAlertRoutes.js';
import bookClubRoutes from './routes/bookClubRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import stripeWebhookHandler from './webhook/stripeWebhook.js';
import { configureTrustProxy } from './config/trustProxy.js';

// Initialize notification subscribers on application boot
import './subscribers/notificationSubscribers.js';

const app = express();

configureTrustProxy(app);

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// Stripe webhook must be parsed as raw body
app.post(
  '/api/payments/webhook',
  express.raw({ type: 'application/json' }),
  stripeWebhookHandler
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/reading-goals', readingGoalRoutes);
app.use('/api/stock-alerts', stockAlertRoutes);
app.use('/api/price-alerts', priceAlertRoutes);
app.use('/api/book-clubs', bookClubRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.use(notFound);
app.use(errorHandler);

export default app;
