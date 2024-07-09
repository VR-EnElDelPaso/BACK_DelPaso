import express, { NextFunction, Request, Response } from "express";
import session from "express-session";
import passport from "passport";
import cors from "cors";
import fs from "fs";

import config from "./config";
import { passportSetUp } from "./passport";
import auth from "./routes/auth";

console.log(`\n***[Environment: ${config.app.env}]***\n`);

const app = express();
const PORT = config.app.port;

const samlStrategy = passportSetUp(passport, config);


app.use(
  session({
    secret: process.env.SESSIONS_SECRET!,
    saveUninitialized: true,
    resave: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use("/api/auth", auth(samlStrategy, passport));

const AuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

app.get("/", AuthMiddleware,(req: Request, res: Response) => {
  res.send(JSON.stringify(req.user));
});



app.post("/api/auth/logout/callback", (req: Request, res: Response) => {
  req.logout((err) => {
    if (err) {
      console.error("Error during logout:", err);
      return res.status(500).send("Error during logout");
    }
    res.redirect("/api/auth/login");
  });
});

app.get("/login/fail", (req: Request, res: Response) =>
  res.status(401).send("Login failed")
);

app.get("/Metadata", (req: Request, res: Response) => {
  res.type("application/xml");
  res
    .status(200)
    .send(
      samlStrategy.generateServiceProviderMetadata(
        fs.readFileSync(__dirname + "/cert/cert.pem", "utf8")
      )
    );
});

//general error handler
app.use((err: any, req: any, res: any, next: (arg0: any) => void) => {
  console.log("Fatal error: " + JSON.stringify(err));
  next(err);
});

//Solo cambie al puerto 4006 de la variable PORT de hasta arriba y agregue las ultimas lineas despues de "Listening on port"
const server = app.listen(PORT, () => console.log('Listening on port %d', PORT));

function RequestWithUser(
  err: Error | null,
  url?: string | null | undefined
): void {
  throw new Error("Function not implemented.");
}
