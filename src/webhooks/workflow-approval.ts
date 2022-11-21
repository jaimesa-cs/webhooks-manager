import { getEntry, getUserDetails, getUserToken, updateWorkflowWithCredentials } from "../utils/contentstack-cm";
import { pass, user } from "../utils/credentials";

import BaseWebhook from "./base";

export default class WorkflowApprovalValidationWebhook extends BaseWebhook {
  id: string = "workflow-approval";
  description: string = "Workflow Approval Webhook";
  constructor() {
    super();
  }

  async execute() {
    const payload = this.getPayload<any>();
    const entry = await getEntry(payload.data.workflow.content_type.uid, payload.data.workflow.entry.uid);
    console.log("last modifier: ", entry.updated_by);
    console.log("workflow actor: ", payload.data.workflow.log.updated_by);
    const valid = entry.updated_by !== payload.data.workflow.log.updated_by;
    console.log("Valid", valid);
    const authtoken = await getUserToken(user, pass);
    let msg = "Workflow Approval Rejected due to restrictions";
    if (!valid) {
      // Stage, Content Approval : blt27b9900d2183c1aa
      // Stage, Ready for Prod: bltbc647b0ce2b27c8a
      const rejectStage = "blt27b9900d2183c1aa";
      const status = await updateWorkflowWithCredentials(
        payload.data.workflow.content_type.uid,
        payload.data.workflow.entry.uid,
        authtoken,
        rejectStage,
        msg
      );
      this.success({
        valid: valid,
        status: msg,
        last_updated_by: entry.updated_by,
        approved_by: payload.data.workflow.log.updated_by,
        payload: payload,
        entry: entry,
      });
    } else {
      const readyStage = "bltbc647b0ce2b27c8a";
      const approverUser = await getUserDetails(payload.data.workflow.log.updated_by, authtoken);
      msg = `Workflow Approval Validation Successful. Approved by ${approverUser.last_name}, ${approverUser.first_name} (${approverUser.email})`;
      const status = await updateWorkflowWithCredentials(
        payload.data.workflow.content_type.uid,
        payload.data.workflow.entry.uid,
        authtoken,
        readyStage,
        msg
      );
      this.success({
        valid: valid,
        last_updated_by: entry.updated_by,
        approved_by: payload.data.workflow.log.updated_by,
        payload: payload,
        entry: entry,
      });
    }
  }
}
