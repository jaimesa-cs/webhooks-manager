import { Request, Response } from "express";

import { IWebhook } from "../interfaces/IWebhook";
import fs from "fs";
import { getJsonUniquePath } from "../utils/contentstack-cm";

export default abstract class BaseWebhook implements IWebhook {
  id: string;
  description: string;
  private request: Request;
  private response: Response;
  private initialized: boolean = false;

  constructor() {}

  getPayload<T>(): T {
    if (this.request && this.request.body) {
      return this.request.body as T;
    }
    return {} as T;
  }
  getDetails() {
    return {
      id: this.id,
      description: this.description,
    };
  }

  getHeader(name: string): string {
    if (this.request.headers.hasOwnProperty(name)) {
      return this.request.headers[name].toString();
    }
    return "";
  }

  getRawPayload(): any {
    return JSON.parse(this.request.body);
  }

  prepare() {}

  success<T>(payload?: string | T) {
    this.response.status(200).send(payload || "OK");
  }
  error<T>(payload?: string | T) {
    this.response.status(500).send(payload || "ERROR");
  }

  async savePayload() {
    try {
      const payload = this.getPayload<any>();
      this.serializeObject(payload.data.entry.uid, payload);
    } catch (e) {
      console.log(e);
    }
  }

  async serializeObject(id: string, obj: any) {
    try {
      const now = new Date();
      const filename = `${id}_${now.toLocaleDateString()}_${now.toLocaleTimeString()}.json`;
      const target = getJsonUniquePath(filename.replace(/\//g, "-").replace(/\s/g, "-").replace(/:/g, "-"));
      fs.writeFile(target, JSON.stringify(obj), (err) => {
        if (err) {
          console.log("Error writing file", err);
        } else {
          // console.log("Successfully wrote file");
        }
      });
    } catch (e) {
      console.log(e);
    }
  }

  init(req: Request, res: Response) {
    this.request = req;
    this.response = res;
    // Default items
    this.response.setHeader("Content-Type", "application/json");
    // End default items
    this.initialized = true;
  }

  abstract execute();
}
