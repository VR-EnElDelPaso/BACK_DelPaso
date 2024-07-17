import { Request, Response, Router } from "express";
import { samlStrategy } from "../passport";
import config from "../config";

const router = Router();

router.get("/", (req: Request, res: Response) => {
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

export default router;