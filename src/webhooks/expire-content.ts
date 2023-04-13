import { deleteAllScheduledItemsForEntry, schedulePublishing } from "../utils/contentstack-cm";

import BaseWebhook from "./base";

export default class ExpireContent extends BaseWebhook {
  id: string = "expire-content";
  description: string = "Schedules an unpublish action for the entry at a specific date, provided in a field";
  constructor() {
    super();
  }

  async execute() {
    //PAYLOAD should not be 'concise', otherwise the 'entry' object won't contain the fields.
    //When bulk publishing, multiple publishing actions are triggered, and the webhook is called for each action (individual entry on a specific locale and environment).
    //Check your webhook settings in Contentstack
    const payload = this.getPayload<any>();

    //Uncomment this line to see the payload
    //console.log("Payload", payload);

    //Environment name
    const environment = payload.data.environment.name;
    //Environment UID
    const environment_uid = payload.data.environment.uid;
    //Entry UID
    const entryUid = payload.data.entry.uid;
    //Content Type UID
    const contentTypeUid = payload.data.content_type.uid;
    //Locale
    const locale = payload.data.entry.locale;
    //Version
    const version = payload.data.entry._version;
    //Entry object from webhook payload
    const entry = payload.data.entry;
    //Field name where the unpublish date is stored (colon separated for nested fields)
    //Example: "field-name:sub-field-name"
    //A Field-Name header is required in the webhook settings in Contentstack
    const fields = this.getHeader("field-name");
    const parts = fields.split(":");

    let unpublishAt: any;

    //Iterate over the fields to reach the date field.
    if (parts.length <= 1) {
      unpublishAt = entry[fields];
    } else {
      parts.forEach((part, index) => {
        if (index === 0) {
          unpublishAt = entry[part];
        } else if (unpublishAt && unpublishAt[part]) {
          unpublishAt = unpublishAt[part];
        }
      });
    }

    //If the date field is found, unpublish the entry
    if (unpublishAt) {
      //Delete all scheduled items for the entry first
      //TODO: ADJUST THIS TO YOUR NEEDS
      await deleteAllScheduledItemsForEntry(entryUid, locale, environment_uid);
      this.success(
        //Schedule the unpublish action
        await schedulePublishing("Unpublish", contentTypeUid, entryUid, version, locale, unpublishAt, environment)
      );
    } else {
      //If the date field is not found, do nothing.
      this.success("No scheduled date found");
    }
  }
}
