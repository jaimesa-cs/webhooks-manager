import DummyWebhook from "./webhooks/dummy";
import Elasticsearch from "./webhooks/elasticsearch";
import GeneratePPTPreview from "./webhooks/generate-ppt-preview";
import GetEntry from "./webhooks/get-entry";
import GetReferences from "./webhooks/get-references";
import LogPayload from "./webhooks/log-payload";
import { container } from "tsyringe";

const webhooks = {
  dummy: DummyWebhook,
  "serialize-payload": LogPayload,
  "get-references": GetReferences,
  "get-entry": GetEntry,
  elasticsearch: Elasticsearch,
  "generate-ppt-preview": GeneratePPTPreview,
};

export const registration = () => {
  for (const [key, value] of Object.entries(webhooks)) {
    container.register(key, value);
  }
};
