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
    console.log(createFolderResponse.data);
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
