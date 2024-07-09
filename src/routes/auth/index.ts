import { Request, Response, Router } from 'express';
import { PassportStatic } from 'passport';
import { type Strategy } from '@node-saml/passport-saml';

const router = Router();

const authRoutes = (samlStrategy: Strategy, passport: PassportStatic) => {
  router.post('/login/callback', passport.authenticate('saml', { failureRedirect: '/login/fail', failureFlash: true }), (req: Request, res: Response) => {
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
    res.redirect('/');
  });

  router.get("/api/auth/logout", (req: any, res) => {
    if (!req.user) res.redirect("/api/auth/login");
    samlStrategy.logout(req, (err, url) => {
      return res.redirect(url!);
    });
  });

  return router;
};

export default authRoutes;