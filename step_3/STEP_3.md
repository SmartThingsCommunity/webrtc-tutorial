# Step 3: Register your Schema integration 

Next, we need to create a record of our Schema connector and register it with the SmartThings platform.  

Begin by creating a JSON file named `schema.json` in your working directory with the contents listed below.

> Make the following substitutions:
>
> * Your email address for `YOUR_EMAIL_HERE`.
> * `OAUTH_CLIENT_ID` with your OAuth client ID (the `CLIENT_ID` in the `.env` file you created in step 1).
> * `OAUTH_CLIENT_SECRET` with your OAuth client secret (`CLIENT_SECRET` in the `.env` file).
> * replace all instances of `FORWARDING_URL` with the `SERVER_URL` value used in step 1.

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

Then, use the CLI to register your Schema integration with the SmartThings platform:

	$ smartthings schema:create -i schema.json

This returns a client ID and secret for your app. The output of the command
should look like this:

```bash
{
    "endpointAppId": "viper_7f634cb0-b0d9-11ee-9eec-9165877943cd",
    "stClientId": "faab3a56-be7c-4a6a-9bab-d4133c69464f",
    "stClientSecret": "9df62b5707...60fa25c752bec989f25e0c1cc816e11fd0991ec"
}
```

Add the values for `stClientId` and `stClientSecret` from the output of the command above
to your `.env` file:

```
ST_CLIENT_ID=faab3a56-be7c-4a6a-9bab-d4133c69464f
ST_CLIENT_SECRET=9df62b5707...60fa25c752bec989f25e0c1cc816e11fd0991ec
```

>**NOTE** 
>If you restart your ngrok endpoint or make a new one, you will be given a new URL address. This will break your existing Schema integration. 
>To resolve this, replace the `SERVER_URL` in your `.env` file with the new URL given when you restarted ngrok. 
>Change all `FORWARD_URL` instances in your `schema.json` file and update your Schema integration using the CLI:

    $ smartthings schema:update

After creating a record of your Schema integration and registering it with the SmartThings platform, 
you are ready to create your Schema connector in [step 4](../step_4/STEP_4.md).
