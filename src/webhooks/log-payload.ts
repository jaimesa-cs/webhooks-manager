import BaseWebhook from "./base";

/**
 * Logs and saves the payload
 */
export default class LogPayload extends BaseWebhook {
  id: string = "serialize-payload";
  description: string = "Serialize payload webhook";
  constructor() {
    super();
  }

  async execute() {
    const payload = this.getPayload();
    console.log("Payload", payload);
    this.savePayload();
    this.success(payload);
  }
}
