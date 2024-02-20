## Step 3 - Register Your Connector

Create a JSON file called `schema.json` with the following contents.

Make the following substitutions:

* your email address for `YOUR_EMAIL_HERE`
* `OAUTH_CLIENT_ID` with your OAuth client id (the `CLIENT_ID` in the `.env` file you created in step 1).
* `OAUTH_CLIENT_SECRET` with your OAuth client secret (`CLIENT_SECRET` in the `.env` file).
* replace all instances of `FORWARDING_URL` with your forwarding URL

```json
{
  "appName": "WebRTC Webcam Connector",
  "partnerName": "WebRTC Webcam Connector",
  "userEmail": "YOUR_EMAIL_HERE",
  "oAuthClientId": "OAUTH_CLIENT_ID",
  "oAuthClientSecret": "OAUTH_CLIENT_SECRET",
  "oAuthAuthorizationUrl": "FORWARDING_URL/oauth/login",
  "oAuthTokenUrl": "FORWARDING_URL/oauth/token",
  "oAuthScope": "read_devices write_devices",
  "hostingType": "webhook",
  "webhookUrl": "FORWARDING_URL/schema",
  "schemaType": "st-schema",
  "icon": "FORWARDING_URL/images/logo.png",
  "icon2x": "FORWARDING_URL/images/logo.png",
  "icon3x": "FORWARDING_URL/images/logo.png"
}
```

Then, use the CLI to register your schema connector:

	$ smartthings schema:create -i schema.json

This creates the record and returns a client id and secret for your app. The output of the command
should look like this:

```bash
{
    "endpointAppId": "viper_7f634cb0-b0d9-11ee-9eec-9165877943cd",
    "stClientId": "faab3a56-be7c-4a6a-9bab-d4133c69464f",
    "stClientSecret": "9df62b5707...60fa25c752bec989f25e0c1cc816e11fd0991ec"
}
```

Add the values for `CLIENT_ID` and `CLIENT_SECRET` from the output of the previous command
into the `.env` file.

```
ST_CLIENT_ID=faab3a56-be7c-4a6a-9bab-d4133c69464f
ST_CLIENT_SECRET=9df62b5707...60fa25c752bec989f25e0c1cc816e11fd0991ec
```

[Previous](../step_2/STEP_2.md)
[Next](../step_4/STEP_4.md)
