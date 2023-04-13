import { getEntry, getEntryForLocale, localizeEntry, updateEntry, updateWorkflowState } from "../utils/contentstack-cm";

import BaseWebhook from "./base";
import { TranslationServiceClient } from "@google-cloud/translate";
import { google } from "@google-cloud/translate/build/protos/protos";

/**
 * Translates a document using Google Cloud Translation
 */
export default class GoogleCloudTranslateDocument extends BaseWebhook {
  id: string = "gc-translate-document";
  description: string = "Use Google Cloud Translate to translate a document";
  constructor() {
    super();
  }

  async execute() {
    console.log("Translating with google...");
    const projectId = "translation-test-349211";
    const location = "global";

    const documentRequest: google.cloud.translation.v3.ITranslateDocumentRequest = {
      parent: `projects/${projectId}/locations/${location}`,
      sourceLanguageCode: "es-es",
      targetLanguageCode: "en-us",
      documentInputConfig: {
        gcsSource: {
          inputUri: "gs://jaime_transcriptions/transcript-from-json.xlsx",
        },
      },
      documentOutputConfig: {
        gcsDestination: {
          outputUriPrefix: "gs://jaime_transcriptions/",
        },
      },
    };
    const translationClient = new TranslationServiceClient();
    const response = await translationClient.translateDocument(documentRequest);
    //   console.log("Translated: ", response);

    // this.success(response.translations);
    this.success(response);
    // this.success(entry.locale_field);
  }
}
