# Easy Webhooks Using Dependency Injection

## TSYRINGE

Basic project using https://www.npmjs.com/package/tsyringe to help with dependency injection.

Main configuration for `tsyringe` resides on the `src/registration.ts` file.
Then, the `WebhookController` class located at `src/controllers/WebhookController.ts` relies on such configuration to distribute calls.

## EXPRESS

The project relies on `express` as the server. https://expressjs.com/

Main configuration for `express` resides on the `src/index.ts` file.

## Run locally

To run locally you just need to execute `yarn run dev` or its npm equivalent.
You will need a .env file in the root of your directory with the following variables:

```bash
NODE_ENV=development
CS_CD_TOKEN=<your_cd_token>
CS_CD_API_KEY=<your_api_key>
CS_CM_TOKEN=<your_cm_token>
CS_CM_API_KEY=<your_api_key>
CS_CM_API_BASE_URL=https://api.contentstack.io
CS_CD_API_BASE_URL=https://cdn.contentstack.io
DEFAULT_FILE_LOCATION=<your_directory_to_save_payloads>
PREVIEW_ASSET_FOLDER=<your_asset_folder_uri>

```

At this point you can hit your local endpoints with a POST request using POSTMAN. Here is an example "publishing" payload for your reference:

```json
{
  "module": "entry",
  "api_key": "blt8d430a87cb9b3e64",
  "event": "publish",
  "triggered_at": "2022-03-08T18:53:24.528Z",
  "data": {
    "entry": { "uid": "blt849840e22a4a273b", "title": "Common Header Static Pages", "locale": "en-us", "_version": 1 },
    "content_type": { "uid": "header_banner", "title": "Header Banner" },
    "environment": {
      "uid": "blt753d88b7df4a0ee4",
      "name": "production",
      "deploy_content": false,
      "urls": [{ "url": "http://localhost:3001", "locale": "en-us" }],
      "servers": []
    },
    "action": "publish",
    "status": "success",
    "locale": "en-us"
  }
}
```

You can post this payload using POSTMAN to the `http://localhost:4000/webhooks/serialize-payload`, for example, and the webhook will save it in your local project int the DEFAULT_FILE_LOCATION configured on your `.env` file.

## Create a new Webhook

Under `src/webhooks` you can find some examples for basic webhooks.
To create your own webhook, simply create a new typescript file in a location of your choice and implement the `IWebhook` interface in it. A `BaseWebhook` class is provided so simplify the implementation:

```ts
import BaseWebhook from "./base";

export default class YourWebhook extends BaseWebhook {
  id: string = "your-webhook";
  description: string = "Your webhook";
  constructor() {
    super();
  }

  async execute() {
    this.success(this.getDetails());
  }
}
```

Your logic should go inside the `execute()` method.

In order for your webhook to be loaded, you need to register it with the dependency injection container. Navigate to the `src/registration.ts` file and add your webhook class there:

```ts
const webhooks = {
  ...
  "your-webhook": YourWebhook

};
```

The key used in this dictionary will be used to map the url of the webhook, so `YourWebhook`, in this case would be accessible via: `http://localhost/webhooks/your-webhook`.

### Using `ngrok` to expose your local webhooks

Contentstack doesn't allow you to use "local" urls for your webhooks (localhost, 127.0.0.1, 192.168..., etc). To workaround this limitation you an use [ngrok](https://ngrok.com)

This will allow you to use an `https` url that will point to your locally running instance so you can demo/show webhooks. Keep in mind that ngrok doesn't persist the urls, so every day (or every so often) the webhook url can change and you will need to update it in Contentstack prior to demo it.

For further details please reach out to jaime@contentstack.com.

### Webhook-Specific Readme

For each webhook look for a dedicated readme file under the docs/`<webhook-id>` folder. e.g. /docs/dummy/README.md, would be the reade for the `dummy.ts` webhook.
