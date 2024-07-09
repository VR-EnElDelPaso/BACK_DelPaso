// dependencies
// external
import express, { NextFunction, Request, Response } from "express";
import session from "express-session";
import cors from "cors";
// local
import passportInstance, {samlStrategy} from "./passport";
import config from "./config";
import authRoutes from "./routes/auth";
import { AuthMiddleware } from "./middlewares";

console.log(`\n***[Environment: ${config.app.env}]***\n`);

const app = express();
const PORT = config.app.port;

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
app.use(passportInstance.initialize());
app.use(passportInstance.session());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// routes
app.use("/api/auth", authRoutes);

app.get("/", AuthMiddleware,(req: Request, res: Response) => {
  res.send(JSON.stringify(req.user));
});

app.get("/Metadata", (req: Request, res: Response) => {
  res.type("application/xml");
  res
    .status(200)
    .send(
      samlStrategy.generateServiceProviderMetadata(
        config.passport.saml.publicCert,
        config.passport.saml.privateKey
      )
    );
});

const server = app.listen(PORT, () => console.log('Listening on port %d', PORT));