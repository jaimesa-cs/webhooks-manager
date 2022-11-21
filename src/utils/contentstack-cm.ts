import * as fs from "fs";

import axios, { AxiosRequestConfig, Method } from "axios";

import useEnvironment from "./environment";

import FormData = require("form-data");
import path = require("path");

const env = useEnvironment();

export const getDefaultAxiosOptions = (options: AxiosRequestConfig<any>): AxiosRequestConfig<any> => {
  return {
    ...options,
    headers: {
      ...options.headers,
      authorization: env.CS_CM_TOKEN,
      api_key: env.CS_CM_API_KEY,
    },
  };
};

export const getJsonUniquePath = (id: string) => {
  return `${env.DEFAULT_FILE_LOCATION}/${id}.json`;
};

export const getEntry = async (contentTypeUid: string, uid: string, includes?: string[]) => {
  const options = getDefaultAxiosOptions({ method: "GET" });
  let url = `${env.CS_CM_API_BASE_URL}/v3/content_types/${contentTypeUid}/entries/${uid}`;
  if (includes) {
    url = `${url}?${includes.join("&include[]=")}`;
  }
  let response = await axios(url, options);
  return Promise.resolve(response.data.entry);
};

export const getEntryWorkflowDetails = async (contentTypeUid: string, uid: string, includes?: string[]) => {
  const options = getDefaultAxiosOptions({ method: "GET" });
  let url = `${env.CS_CM_API_BASE_URL}/v3/content_types/${contentTypeUid}/entries/${uid}`;
  let char = "?";
  if (includes) {
    url = `${url}?${includes.join("&include[]=")}`;
    char = "&";
  }
  url = `${url}${char}include_workflow=true`;
  let response = await axios(url, options);
  return Promise.resolve(response.data.entry);
};
export const getEntryForLocale = async (contentTypeUid: string, uid: string, locale: string, includes?: string[]) => {
  const options = getDefaultAxiosOptions({ method: "GET" });
  let url = `${env.CS_CM_API_BASE_URL}/v3/content_types/${contentTypeUid}/entries/${uid}?locale=${locale}`;
  if (includes) {
    url = `${url}&${includes.join("&include[]=")}`;
  }
  let response = await axios(url, options);
  return Promise.resolve(response.data.entry);
};

export const getAssetFolder = async (contentTypeUid: string) => {
  const options = getDefaultAxiosOptions({ method: "GET" });
  const response = await axios(
    `${env.CS_CM_API_BASE_URL}/v3/assets?include_folders=true&query={"is_dir": true}&folder=${env.PREVIEW_ASSET_FOLDER}`,
    options
  );

  let folderUid = "";
  if (response && response.data && response.data.assets && response.data.assets.length > 0) {
    const a = response.data.assets.filter((f) => f.name === contentTypeUid);
    if (a && a.length > 0) {
      folderUid = a[0].uid;
    }
  }
  if (folderUid !== "") {
    // console.log("Folder found for content type: ", contentTypeUid, folderUid);
    return Promise.resolve(folderUid);
  } else {
    // console.log("Creating folder for content type: ", contentTypeUid);
    const createFolderOptions = getDefaultAxiosOptions({
      method: "POST",
      data: {
        asset: {
          name: contentTypeUid,
          parent_uid: env.PREVIEW_ASSET_FOLDER,
        },
      },
    });
    const createFolderResponse = await axios(`${env.CS_CM_API_BASE_URL}/v3/assets/folders`, createFolderOptions);
    // console.log(createFolderResponse.data);
    return Promise.resolve(createFolderResponse.data.asset.uid);
  }
};

export const saveAsset = async (path: string, contentTypeUid: string, entryUid: string) => {
  let url = `${env.CS_CM_API_BASE_URL}/v3/assets`;
  let method: Method = "POST";
  var data = new FormData();

  const folderUid = await getAssetFolder(contentTypeUid);
  const assetUid = await getAssetUid(folderUid, `${entryUid}.pptx`);

  if (assetUid !== "") {
    method = "PUT";
    url = `${url}/${assetUid}`;
  } else {
    data.append("asset[parent_uid]", folderUid);
  }

  data.append("asset[upload]", fs.createReadStream(path));

  const options = getDefaultAxiosOptions({ method: method, headers: { ...data.getHeaders() }, data: data });
  let response = await axios(url, options);
  return Promise.resolve(response.data.asset);
};

export const getAssetUid = async (folderUid: string, assetName: string) => {
  const options = getDefaultAxiosOptions({ method: "GET" });
  const response = await axios(`${env.CS_CM_API_BASE_URL}/v3/assets?folder=${folderUid}`, options);
  if (response && response.data && response.data.assets && response.data.assets.length > 0) {
    const a = response.data.assets.filter((f) => f.title === assetName);
    if (a && a.length > 0) {
      return Promise.resolve(a[0].uid);
    }
  }
  return Promise.resolve("");
};

export const schedulePublishing = async (
  operation: "Publish" | "Unpublish",
  contentTypeUid: string,
  entryUid: string,
  version: number,
  locales: string[],
  date: string,
  environment: string
) => {
  switch (operation) {
    case "Publish":
      return schedulePublish(contentTypeUid, entryUid, version, locales, date, environment);
    case "Unpublish":
      return scheduleUnpublish(contentTypeUid, entryUid, version, locales, date, environment);
  }
};

const schedulePublish = async (
  contentTypeUid: string,
  entryUid: string,
  version: number,
  locales: string[],
  date: string,
  environment: string
) => {
  console.log("Scheduling unpublishing for entry: ", entryUid, "of contentType:", contentTypeUid);
  return Promise.resolve(200);
};

const scheduleUnpublish = async (
  contentTypeUid: string,
  entryUid: string,
  version: number,
  locales: string[],
  date: string,
  environment: string
) => {
  console.log("Scheduling unpublishing for entry: ", entryUid, "of contentType:", contentTypeUid, " on ", date);
  const data = {
    entry: {
      environments: [environment],
      locales: locales,
    },
    locale: locales[0],
    version: version,
    scheduled_at: date,
  };
  const options = getDefaultAxiosOptions({ method: "POST", data: data });

  const response = await axios(
    `${env.CS_CM_API_BASE_URL}/v3/content_types/${contentTypeUid}/entries/${entryUid}/unpublish`,
    options
  );
  console.log("Status", response.status);
  return Promise.resolve(response.status);
};

export const updateWorkflowWithCredentials = async (
  contentTypeUid: string,
  uid: string,
  authtoken: string,
  stageUid: string,
  msg: string
) => {
  // Workflow: blt87086c5984c9a433

  // Approver Role: not needed
  const data = {
    workflow: {
      workflow_stage: {
        comment: msg,
        notify: false,
        uid: stageUid,
      },
    },
  };
  const response = await axios(`${env.CS_CM_API_BASE_URL}/v3/content_types/${contentTypeUid}/entries/${uid}/workflow`, {
    method: "POST",
    data: data,
    headers: {
      api_key: env.CS_CM_API_KEY,
      authtoken: authtoken,
    },
  });
  return response.data;
};
export const getUserDetails = async (userUid: string, adminUserToken: string) => {
  const response = await axios(`${env.CS_CM_API_BASE_URL}/v3/stacks?include_collaborators=true`, {
    method: "GET",
    headers: {
      api_key: env.CS_CM_API_KEY,
      organization_uid: env.CS_CM_ORGANIZATION_UID,
      authtoken: adminUserToken,
    },
  });
  const found = response.data.stack.collaborators.find((c) => c.uid === userUid);
  return found ?? { uid: userUid, first_name: "Unknown", last_name: "Unknown", email: "Unknown" };
};
export const getUserToken = async (user: string, pass: string) => {
  const response = await axios(`${env.CS_CM_API_BASE_URL}/v3/user-session`, {
    method: "POST",
    data: {
      user: {
        email: user,
        password: pass,
      },
    },
  });
  return response.data.user.authtoken;
};

export const updateEntry = async (contentTypeUid: string, entryUid: string, locale: string, data: any) => {
  const options = getDefaultAxiosOptions({ method: "PUT", data: data });
  try {
    const response = await axios(
      `${env.CS_CM_API_BASE_URL}/v3/content_types/${contentTypeUid}/entries/${entryUid}?locale=${locale}`,
      options
    );
    if (response && response.data && response.data.entry) {
      return Promise.resolve(response.data.entry.uid);
    }
  } catch (e) {
    console.log(e);
    console.log(JSON.stringify(e));
    Promise.resolve("");
  }
  return Promise.resolve("");
};

export const updateWorkflowState = async (contentTypeUid: string, entryUid: string, locale: string, data: any) => {
  const options = getDefaultAxiosOptions({ method: "POST", data: data });
  const response = await axios(
    `${env.CS_CM_API_BASE_URL}/v3/content_types/${contentTypeUid}/entries/${entryUid}/workflow?locale=${locale}`,
    options
  );
  if (response && response.data && response.data.notice) {
    return Promise.resolve(response.data.notice);
  }
  return Promise.resolve("");
};

export const localizeEntry = async (contentTypeUid: string, entryUid: string, locale: string, data: any) => {
  const options = getDefaultAxiosOptions({ method: "PUT", data: data });
  try {
    const response = await axios(
      `${env.CS_CM_API_BASE_URL}/v3/content_types/${contentTypeUid}/entries/${entryUid}?locale=${locale}
      `,
      options
    );
    if (response && response.data && response.data.notice) {
      return Promise.resolve(response.data.notice);
    }
  } catch (e) {
    console.log(e);
    return Promise.resolve(e);
  }

  return Promise.resolve("");
};
