import BaseWebhook from "./base";

/**
 * Dummy webhook
 */
export default class DummyWebhook extends BaseWebhook {
  id: string = "dummy";
  description: string = "Dummy webhook";
  constructor() {
    super();
  }

  async execute() {
    this.success(this.getDetails());
  }
}
