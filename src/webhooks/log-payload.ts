import BaseWebhook from "./base";

export default class LogPayload extends BaseWebhook {
  id: string = "serialize-payload";
  description: string = "Serialize payload webhook";
  constructor() {
    super();
  }

  async execute() {
    const payload = this.getPayload();
    this.savePayload();
    this.success(payload);
  }
}
