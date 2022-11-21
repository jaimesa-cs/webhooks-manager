import { getEntry, schedulePublishing } from "../utils/contentstack-cm";
import { isTooManyTries, retryAsync } from "ts-retry";

import BaseWebhook from "./base";
import { retrySync } from "../utils/retry";

export default class UnpublishAt extends BaseWebhook {
  id: string = "unpublish-at";
  description: string = "Unpublish and entry at a specific date, provided in a field";
  constructor() {
    super();
  }

  async execute() {
    const payload = this.getPayload<any>();
    const environment = payload.data.environment.name;
    const entryUid = payload.data.entry.uid;
    const contentTypeUid = payload.data.content_type.uid;
    const locale = payload.data.entry.locale;
    const version = payload.data.entry._version;

    const entry = await getEntry(contentTypeUid, entryUid);
    const fields = this.getHeader("field-name");
    // console.log("Payload", payload);
    if (fields.indexOf(":") > -1) {
      const parts = fields.split(":");
      let value: any;
      for (let i = 0; i < parts.length; i++) {
        let obj: any = entry[parts[i]];

        if (obj) {
          value = entry[parts[i]];
        } else {
          break;
        }
      }
      const unpublishAt = value[parts[parts.length - 1]];

      try {
        await retryAsync(
          async (): Promise<number> => {
            return schedulePublishing(
              "Unpublish",
              contentTypeUid,
              entryUid,
              version,
              [locale],
              unpublishAt,
              environment
            );
          },
          {
            delay: 100,
            maxTry: 5,
            until: (lastResult) => lastResult.toString().startsWith("4"),
          }
        );
        this.success();
      } catch (err) {
        if (isTooManyTries(err)) {
          this.success("Too many attempts!", 201);
        } else {
          this.error(err);
        }
      }
    }
  }
}
