import { Request, Response } from "express";

export interface IWebhook {
  id: string;
  description: string;
  init: (req: Request, res: Response) => void;
  getDetails: () => any;
  execute: () => Promise<void>;
}
