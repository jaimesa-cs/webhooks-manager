import { getEntry, getEntryForLocale, localizeEntry, updateEntry, updateWorkflowState } from "../utils/contentstack-cm";

import BaseWebhook from "./base";
import { TranslationServiceClient } from "@google-cloud/translate";

/**
 * Translates an entry using Google Cloud Translation and then updates the entry back in Contentstack
 */
export default class GoogleCloudTranslate extends BaseWebhook {
  id: string = "gc-translate";
  description: string = "Use Google Cloud Translate to translate text";
  constructor() {
    super();
  }

  async execute() {
    console.log("Translating with google...");
    const payload = this.getPayload<any>();
    // console.log("payload", payload);
    const entryUid = payload.data.workflow.entry.uid;
    const contentTypeUid = payload.data.workflow.content_type.uid;

    const entry = await getEntry(contentTypeUid, entryUid);

    const translationClient = new TranslationServiceClient();

    const locales = entry.locale_field.select_locale;
    console.log("Locales: ", locales);
    for (let index = 0; index < locales.length; index++) {
      const locale = locales[index];
      const request = getRequestForText([entry.title, entry.copyright], locale);
      const [response] = await translationClient.translateText(request);
      //   console.log("Translated: ", response);
      //1. Get the target locale entry, update it, then update its workflow state to "Draft"
      const langEntry = await getEntryForLocale(contentTypeUid, entryUid, locale);
      const data = {
        entry: {
          //   ...langEntry,
          title: response.translations[0].translatedText,
          copyright: response.translations[1].translatedText,
          locale: locale,
        },
      };
      const updatedEntry = await updateEntry(contentTypeUid, entryUid, locale, data);
      //   const updatedEntry = await localizeEntry(contentTypeUid, entryUid, locale, data);
      if (updatedEntry !== "") {
        //TODO: Update the workflow state of the locale-specific entry to "Draft"
        const langWfData = getWfData();
        const langNotice = await updateWorkflowState(contentTypeUid, entryUid, locale, langWfData);
        console.log("Updated workflow state of entry: ", langEntry.uid, " notice: ", langNotice);
      }
    }
    // Update entry workflow state to "Translated"
    const wfData = getWfData();
    const notice = await updateWorkflowState(contentTypeUid, entryUid, "en-us", wfData);
    // this.success(response.translations);
    this.success(notice);
    // this.success(entry.locale_field);
  }
}
const getWfData = () => {
  return {
    workflow: {
      workflow_stage: {
        comment: "Entry automatically translated",
        notify: false,
        uid: "blt1e42c2a3e01eaa02",
      },
    },
  };
};
const getRequestForText = (texts: string[], target: string) => {
  const projectId = "translation-test-349211";
  const location = "global";
  const text = "Hello, world!";

  return {
    parent: `projects/${projectId}/locations/${location}`,
    contents: texts,
    mimeType: "text/plain", // mime types: text/plain, text/html
    sourceLanguageCode: "en",
    targetLanguageCode: target,
  };
};
