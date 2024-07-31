// third party
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
import { AuthMiddleware } from "./middlewares";

const app = express();

// app configuration
app.use( // session configuration
  session({
    secret: process.env.SESSIONS_SECRET!,
    saveUninitialized: true,
    resave: true,
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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// routes
app.use("/api/auth", authRoutes);
app.use("/Metadata" ,metadataRoutes);
app.use("/api/tour", tourRoutes);

app.get("/", AuthMiddleware,(req: Request, res: Response) => {
  res.send(JSON.stringify(req.user));
});

export default app;