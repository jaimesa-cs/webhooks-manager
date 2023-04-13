import { Request, Response } from "express";
import { getEntry, getEntryWorkflowDetails, getJsonUniquePath } from "../utils/contentstack-cm";

import { IWebhook } from "../interfaces/IWebhook";
import fs from "fs";

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
    // console.log(this.request.headers);
    if (this.request.headers.hasOwnProperty(name)) {
      return this.request.headers[name].toString();
    }
    return "";
  }

  getRawPayload(): any {
    return JSON.parse(this.request.body);
  }

  getRequestBody(): any {
    return this.request.body;
  }

  prepare() {}

  success<T>(payload?: string | T, status: number = 200) {
    this.response.status(200).json(payload || "OK");
  }
  error<T>(payload?: string | T) {
    this.response.status(500).json(payload || "ERROR");
  }

  async savePayload() {
    try {
      const payload = this.getPayload<any>();
      const uid = payload.data?.entry?.uid || payload.data?.workflow?.entry?.uid;
      this.serializeObject(uid, payload);
      return payload;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async saveWorkflowDetails() {
    try {
      const payload = this.getPayload<any>();
      const uid = payload.data?.workflow?.entry?.uid;
      if (!uid) {
        this.serializeObject(`${uid}_wf_details`, {
          error: "Not able to save entry workflow details",
          payload: payload,
        });
      } else {
        const entryDetails = getEntryWorkflowDetails(payload.data.workflow.content_type.uid, uid);
        this.serializeObject(uid, entryDetails);
      }

      return payload;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async serializeObject(id: string, obj: any) {
    try {
      const now = new Date();
      const filename = `${id}_${now.toLocaleDateString()}_${now.toLocaleTimeString()}`;
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
