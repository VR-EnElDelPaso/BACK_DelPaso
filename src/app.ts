// ----[third party]----
import express, { NextFunction, Request, Response } from "express";
import session from "express-session";
import cors from "cors";
import morgan from "morgan";
// local
import passportInstance from "./passport";
import config from "./config";
import authRoutes from "./routes/auth.routes";
import metadataRoutes from "./routes/metadata.routes";
import tourRoutes from "./routes/tour.routes";
import preferenceRoutes from "./routes/preference.routes";
import userRoutes from "./routes/user.routes";
import reviewsRoutes from "./routes/reviews.routes";
import museumsRoutes from "./routes/museums.routes";
import storageRoutes from "./routes/storage.routes";
import mpWebHookRoutes from "./routes/webhook.routes";
import orderRoutes from "./routes/order.routes";
import tagRoutes from './routes/tag.routes';
import carouselRoutes from './routes/carousel.routes';
import faqRoutes from "./routes/faq.routes";

// ----[middlewares]----
import { authMiddleware, setUserMiddleware } from "./middlewares/auth.middlewares";

const app = express();

// ----[app configuration]----
app.use( // session configuration
  session({
    secret: process.env.SESSIONS_SECRET!,
    saveUninitialized: true,
    resave: true,
    cookie: {
      httpOnly: true,
      secure: config.app.env === "production"
    }
  })
);

app.use((err: any, req: Request, res: Response, next: NextFunction) => { // error handling
  console.log("Fatal error: " + JSON.stringify(err));
  next(err);
});

app.use(cors({
  origin: config.app.clientUrl,
  credentials: true, // allow cookies
}));

app.use(passportInstance.initialize());
app.use(passportInstance.session());

app.use(express.json({ limit: "10mb" })); // limit 10MB for image uploads
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(morgan("dev"));

// ----[routes]----
app.use("/api/auth", authRoutes);
app.use("/Metadata", metadataRoutes);
app.use("/api/tours", [setUserMiddleware], tourRoutes);
app.use("/api/preferences", preferenceRoutes);
app.use("/api/webhooks", mpWebHookRoutes);
app.use("/api/user", userRoutes);
app.use("/api/reviews", reviewsRoutes)
app.use("/api/museums", museumsRoutes);
app.use("/api/storage", storageRoutes);
app.use("/api/orders", orderRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/carousels', carouselRoutes);
app.use("/api/faqs", faqRoutes);

app.get("/", [authMiddleware], (req: Request, res: Response) => {
  res.send(JSON.stringify(req.user));
});

export default app;