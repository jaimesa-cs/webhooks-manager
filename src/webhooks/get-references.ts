import { getDefaultAxiosOptions, getEntry } from "../utils/contentstack-cm";

import BaseWebhook from "./base";
import axios from "axios";
import useEnvironment from "../utils/environment";

export default class GetReferences extends BaseWebhook {
  id: string = "get-references";
  description: string = "Get references webhook";
  constructor() {
    super();
  }

  async execute() {
    try {
      const payload = this.getPayload<any>();
      const entryUid = payload.data.entry.uid;
      const contentTypeUid = payload.data.content_type.uid;
      const env = useEnvironment();
      const options = getDefaultAxiosOptions({ method: "GET" });
      let response = await axios(
        `${env.CS_CM_API_BASE_URL}/v3/content_types/${contentTypeUid}/entries/${entryUid}/references`,
        options
      );

      return this.success(response.data);
    } catch (e) {
      console.log(e);
      this.error(e);
    }
  }
}
