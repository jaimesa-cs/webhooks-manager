import axios, { AxiosRequestConfig } from "axios";

import useEnvironment from "./environment";

const env = useEnvironment();

export const getDefaultAxiosOptions = (options: AxiosRequestConfig<any>): AxiosRequestConfig<any> => {
  return {
    ...options,
    headers: {
      ...options.headers,
      access_token: env.CS_CD_TOKEN,
      api_key: env.CS_CD_API_KEY,
    },
  };
};

export const getJsonUniquePath = (id: string) => {
  return `${env.DEFAULT_FILE_LOCATION}/${id}.json`;
};

export const getEntry = async (contentTypeUid: string, uid: string, environment: string, includes?: string[]) => {
  const options = getDefaultAxiosOptions({ method: "GET" });
  let url = `${env.CS_CD_API_BASE_URL}/v3/content_types/${contentTypeUid}/entries/${uid}?environment=${environment}`;
  if (includes) {
    url = `${url}&include[]=${includes.join("&include[]=")}`;
  }
  // console.log(url);
  let response = await axios(url, options);
  return Promise.resolve(response.data.entry);
};
