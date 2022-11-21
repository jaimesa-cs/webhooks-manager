import "reflect-metadata";

import WebhookController from "./controllers/WebhookController";
import { container } from "tsyringe";
import express from "express";

const port = process.env.port || 4001;

const app = express();

app.use(express.json());

app.use("/webhooks", container.resolve(WebhookController).routes());
app.listen(port, () => console.log(`listening on port: ${port}`));
