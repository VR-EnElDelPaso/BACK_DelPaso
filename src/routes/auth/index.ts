// dependencies
import { NextFunction, Request, Response, Router } from 'express';
import passportInstance, { samlStrategy } from '../../passport';
import { AuthMiddleware } from '../../middlewares';
import config from '../../config';


const router = Router();
const { clientUrl } = config.app;

// login endpoints
router.get('/login', passportInstance.authenticate('saml', { failureRedirect: '/login/fail', failureFlash: true }), (req, res) => res.redirect('/'));

router.post('/login/callback', passportInstance.authenticate('saml', { failureRedirect: '/login/fail', failureFlash: true }), (req: Request, res: Response) => {
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
  res.redirect(clientUrl);
});

router.get("/login/fail", (req: Request, res: Response) =>
  res.status(401).send("Login failed")
);

// logout endpoints
router.get("/logout", AuthMiddleware, (req: any, res: Response, next: NextFunction) => {
  samlStrategy.logout(req, (err, url) => {

    if (err) {
      return res.status(500).json(
        {
          ok: false,
          message: "Error during logout",
        }
      )
    }

    req.session.destroy((err: any) => {
      if (err) {
        return res.status(500).json(
          {
            ok: false,
            message: "Error during logout",
          }
        )
      }
    }
    );

    if (!url) {
      return res.status(500).json(
        {
          ok: false,
          message: "Error during logout",
        }
      )
    }

    return res.redirect(url);
  });
});

router.post("/logout/callback", (req: Request, res: Response, next: NextFunction) => {
  try {
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      return res.redirect(clientUrl);
    });
  } catch (error) {
    return next(error);
  }
});

// Auth status endpoint
router.get("/status", (req: Request, res: Response) => {
  if (req.isAuthenticated()) {
    res.json({ isAuthenticated: true, user: req.user });
  } else {
    res.json({ isAuthenticated: false });
  }
});

export default router;
