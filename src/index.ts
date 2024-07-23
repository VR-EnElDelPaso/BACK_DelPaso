// todo: merge error, jump to next commit

import app from "./app";
import config from "./config";

import express, { Request, Response } from "express";
import session from "express-session";
import passport from "passport";
import saml, { VerifyWithoutRequest, Strategy } from "@node-saml/passport-saml";
import cors from "cors";

import { PrismaClient } from "@prisma/client";

// prisma
const prisma = new PrismaClient();
const app = express();
const PORT = 4006 || process.env.PORT;

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user: any, done) => done(null, user));

const samlStrategy = new Strategy(
  {
    callbackUrl: "http://localhost:4006/login/callback",
    entryPoint: "https://wayf.ucol.mx/saml2/idp/SSOService.php",
    logoutUrl: "https://wayf.ucol.mx/saml2/idp/SingleLogoutService.php",
    logoutCallbackUrl: "http://localhost:4006/api/auth/logout/callback",
    issuer: "http://localhost/20166932",
    decryptionPvk: fs.readFileSync(__dirname + "/cert/key.pem", "utf8")!,
    privateKey: fs.readFileSync(__dirname + "/cert/key.pem", "utf8")!,
    idpCert: fs.readFileSync(__dirname + "/cert/idp.crt", "utf8")!,
    publicCert: fs.readFileSync(__dirname + "/cert/cert.pem", "utf8")!,
  },
  ((profile, done) =>
    done(null, profile as Record<string, unknown>)) as VerifyWithoutRequest,
  ((profile, done) =>
    done(null, profile as Record<string, unknown>)) as VerifyWithoutRequest
);

app.use(
  session({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized: true,
    resave: true,
  })
);

passport.use(samlStrategy);
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.get("/", (req: Request, res: Response) => res.redirect("/login"));

app.get('/login', passport.authenticate('saml', { failureRedirect: '/login/fail', failureFlash: true }), (req, res) => res.redirect('/'));

app.post('/api/auth/login/callback', passport.authenticate('saml', {
  failureRedirect: '/login/fail',
  failureFlash: true
}), (req: Request, res: Response) => {
  // const uCorreo = req.user?.uCorreo;
  // const uNombre = req.user?.uNombre;
  // const uDependencia = req.user?.uDependencia;
  // const uCuenta = req.user?.uCuenta;
  // const uTrabajador = req.user?.uTrabajador;
  // const uTipo = req.user?.uTipo;
  // const cn = req.user?.cn;
  // const sn = req.user?.sn;
  // const displayName = req.user?.displayName;
  // const givenName = req.user?.givenName;
  res.send(req.user);
}
);

app.get("/logout", (req: any, res) => {
  if (!req.user) res.redirect("/");

  samlStrategy.logout(req, (err, url) => {
    return res.redirect(url!);
  });
});

app.post("/api/auth/logout/callback", (req: Request, res: Response) => {
  req.logout((err) => {
    if (err) {
      console.error("Error during logout:", err);
      return res.status(500).send("Error during logout");
    }
    res.redirect("/");
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
const server = app.listen(PORT, async () => {
  console.log('Listening on port %d', (server.address() as import('net').AddressInfo).port);
  const x = await prisma.recorridos_comprados.findMany();
  console.log(x);
});

function RequestWithUser(
  err: Error | null,
  url?: string | null | undefined
): void {
  throw new Error("Function not implemented.");
}

app.listen(
  config.app.port,
  () => console.log('Listening on port %d', config.app.port)
);