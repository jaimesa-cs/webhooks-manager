import BaseWebhook from "./base";
import { getEntry } from "../utils/contentstack-cm";

/**
 * Returns the entry
 */
export default class GetEntry extends BaseWebhook {
  id: string = "get-entry";
  description: string = "Get entry webhook";
  constructor() {
    super();
  }

  async execute() {
    const payload = this.getPayload<any>();
    const entryUid = payload.data.entry.uid;
    const contentTypeUid = payload.data.content_type.uid;

    this.success(await getEntry(contentTypeUid, entryUid));
  }
}
