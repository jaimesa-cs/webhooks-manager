import { autoInjectable, container } from "tsyringe";

import Express from "express";
import { IWebhook } from "../interfaces/IWebhook";
import { registration } from "../registration";

@autoInjectable()
export default class WebhookController {
  router: Express.Router;
  constructor() {
    this.router = Express.Router();
    registration();
  }

  routes() {
    this.router.post("/:webhookId", (_req: Express.Request, res: Express.Response) => {
      try {
        const webhookId = _req.params.webhookId;
        const svc = container.resolve(webhookId) as IWebhook;
        svc.init(_req, res);
        const promise = svc.execute();
        return promise;
      } catch (e) {
        console.log(e);
      }
    });
    return this.router;
  }
}
