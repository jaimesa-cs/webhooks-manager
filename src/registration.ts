import DummyWebhook from "./webhooks/dummy";
import Elasticsearch from "./webhooks/elasticsearch";
import GeneratePPTPreview from "./webhooks/generate-ppt-preview";
import GetEntry from "./webhooks/get-entry";
import GetReferences from "./webhooks/get-references";
import GoogleCloudTranslate from "./webhooks/gc-translate";
import GoogleCloudTranslateDocument from "./webhooks/gc-translate-document";
import LogPayload from "./webhooks/log-payload";
import UnpublishAt from "./webhooks/unpublish-at";
import VerifyWebhookRequest from "./webhooks/verify";
import WorkflowApprovalValidationWebhook from "./webhooks/workflow-approval";
import { container } from "tsyringe";

const webhooks = {
  dummy: DummyWebhook,
  "serialize-payload": LogPayload,
  "get-references": GetReferences,
  "get-entry": GetEntry,
  elasticsearch: Elasticsearch,
  "generate-ppt-preview": GeneratePPTPreview,
  "unpublish-at": UnpublishAt,
  "gc-translate": GoogleCloudTranslate,
  "gc-translate-document": GoogleCloudTranslateDocument,
  "verify-webhook-request": VerifyWebhookRequest,
  "workflow-approval": WorkflowApprovalValidationWebhook,
};

export const registration = () => {
  for (const [key, value] of Object.entries(webhooks)) {
    container.register(key, value);
  }
};
