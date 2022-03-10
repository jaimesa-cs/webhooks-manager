import BaseWebhook from "./base";

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
