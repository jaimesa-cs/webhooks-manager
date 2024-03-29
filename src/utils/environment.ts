import * as dotenv from "dotenv";

export default function useEnvironment() {
  dotenv.config();
  const values = {
    NODE_ENV: process.env.NODE_ENV || "production",
    CS_CM_TOKEN: process.env.CS_CM_TOKEN || "",
    CS_CD_TOKEN: process.env.CS_CD_TOKEN || "",
    CS_CM_API_KEY: process.env.CS_CM_API_KEY || "",
    CS_CD_API_KEY: process.env.CS_CD_API_KEY || "",
    CS_CM_API_BASE_URL: process.env.CS_CM_API_BASE_URL || "",
    CS_CM_ORGANIZATION_UID: process.env.CS_CM_ORGANIZATION_UID || "",
    CS_CD_API_BASE_URL: process.env.CS_CD_API_BASE_URL || "",
    PREVIEW_ASSET_FOLDER: process.env.PREVIEW_ASSET_FOLDER || "",
    DEFAULT_FILE_LOCATION: process.env.DEFAULT_FILE_LOCATION || "",
  };
  // if (process.env.NODE_ENV && process.env.NODE_ENV === "development") {
  // console.log("LOADING DEVELOPMENT ENVIRONMENT");
  // console.log("Environment ------------------------------------------------ ");
  // console.log(values);
  // console.log("------------------------------------------------ Environment ");
  // }

  return values;
}
