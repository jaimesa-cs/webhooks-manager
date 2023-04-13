import BaseWebhook from "./base";
import { Client } from "@elastic/elasticsearch";
import { getEntry } from "../utils/contentstack-cm";

/**
 * Indexes entry in Elasticsearch
 */
export default class Elasticsearch extends BaseWebhook {
  id: string = "elasticsearch";
  description: string = "Elasticsearch webhook";
  constructor() {
    super();
  }

  async execute() {
    try {
      const payload = this.getPayload<any>();
      const entryUid = payload.data.entry.uid;
      const contentTypeUid = payload.data.content_type.uid;
      const entry = await getEntry(contentTypeUid, entryUid);

      const client = new Client({
        node: "https://localhost:9200",
      });
      const flattenedEntry = {
        ...entry,
        version: entry._version,
      };
      delete flattenedEntry._version;
      delete flattenedEntry.ACL;
      delete flattenedEntry._in_progress;

      await client.index({
        index: "cs-bazar",
        id: entryUid,
        document: flattenedEntry,
      });
      this.success(`Entry ${entry.title} has been indexed!`);
    } catch (e) {
      this.error(e);
    }
  }
}
