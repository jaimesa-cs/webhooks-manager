import DummyWebhook from "../../src/webhooks/dummy";
import WebhookController from "../../src/controllers/WebhookController";
import sinon from "sinon";

describe("WebhookManager >", () => {
  beforeEach(() => {});

  test("dummy >", async () => {
    const dummyWebhook = new DummyWebhook();
    expect(dummyWebhook.id).toBe("dummy");
    expect(dummyWebhook.description).toBe("Dummy webhook");
  });
});
