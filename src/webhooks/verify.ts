import BaseWebhook from "./base";
const crypto = require("crypto");

/**
 * Verify Webhook Requests
 */
export default class VerifyWebhookRequest extends BaseWebhook {
  id: string = "verify-webhook-request";
  description: string = "Verify Webhook Requests";
  constructor() {
    super();
  }

  async execute() {
    console.log("Verify Webhook Request");
    const hashAlgo = "sha256";
    const publicKey = getKey();
    console.log(`publicKey: ${publicKey}`);
    const body = this.getRequestBody();
    console.log("Body: ", body);

    if (isVerified(hashAlgo, body, publicKey, this.getHeader("X-Contentstack-Request-Signature"))) {
      console.log(`Received verified message: ${body}`);
    } else {
      console.log("Unable to verify signature");
    }
  }
}

function getKey() {
  const keyString = `-----BEGIN RSA PUBLIC KEY-----\nMIIBCgKCAQEA7yw+/NU8nPrCRBYSMDppo3fdBxba+a8mmOOMTMj5GBsVX2nSXcON\nknI5RFpz0F3Stk9S0hRse5EWockB1cVNCJF1/UGCkC2Zc86jeAcmEQ+OtiIQ4sQP\nB8o1waTqfXMLklWcO6cMYJqw6TcMi4TOeOd+cBPrujNcjl00Hz7vrFVrfHgg3+rV\nZQKfxW6VESeTkg1N0o8aI0zU0lPE4UsHwyoHelWybdb+aJR7921akdwh1fITB1wY\nAfJWqqUKzsgTixNAxFCDt23DgX26HP4wo0zhf25qrL1a7FaGaFnsCbwrXlpxNcfF\n3HlwozNEslon2sQuFnbkct0TzPblpJBjkQIDAQAB\n-----END RSA PUBLIC KEY-----`;

  return crypto.createPublicKey({
    key: keyString,
    format: "pem",
    type: "pkcs1",
  });
}

const isVerified = (hashAlgo: any, body: any, publicKey: any, signature: any) =>
  crypto.verify(
    hashAlgo,
    Buffer.from(JSON.stringify(body)),
    {
      key: publicKey,
      padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
    },
    Buffer.from(signature, "base64")
  );
