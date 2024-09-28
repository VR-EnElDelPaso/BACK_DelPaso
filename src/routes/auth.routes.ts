// dependencies
// third party
import { NextFunction, Request, Response, Router } from 'express';

// local
import UserWithoutPassword from '../types/auth/UserWithoutPassword';
import passportInstance, { generateToken, samlStrategy } from '../passport';
import { AuthMiddleware } from '../middlewares';
import config from '../config';
import ResponseData from '../types/auth/ResponseData';

const router = Router();
const { clientUrl } = config.app;


// --- Login ---

// local auth login
router.post('/login/local', passportInstance.authenticate('local', { session: false }), (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ ok: false, message: 'User not authenticated' } as ResponseData);
  }

  const token = generateToken(req.user as UserWithoutPassword);
  const response: ResponseData = {
    ok: true,
    message: 'Login successful',
    data: { token }
  };
  res.status(200).json(response);
});

// saml login
router.get('/login', passportInstance.authenticate('saml', { failureRedirect: '/login/fail', failureFlash: true }), (req, res) => res.redirect('/'));

// saml login callback
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

// saml login fail
router.get("/login/fail", (req: Request, res: Response) =>
  res.status(401).send("Login failed")
);




// --- Logout ---

// saml logout
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

// saml logout callback
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




// --- Auth test ---

router.get('/protected', passportInstance.authenticate('jwt', { session: false }), (req: Request, res: Response) => {
  res.json({ message: 'This is a protected route', user: req.user });
});

// Auth status endpoint
router.get("/status", (req: Request, res: Response) => {
  if (req.isAuthenticated()) {
    res.status(200).json({ isAuthenticated: true, user: req.user });
  } else {
    res.status(401).json({ isAuthenticated: false });
  }
});


export default router;
