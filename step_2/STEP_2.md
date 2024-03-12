## Step 2 - Create a Device Profile

We need a [device profile](https://developer.smartthings.com/docs/devices/device-profiles/) for our
camera devices we'll be creating.

You can use the CLI to create a device profile. You must use the CLI version 1.8.1 or higher. You can download it from
[ST CLI] (https://github.com/SmartThingsCommunity/smartthings-cli/releases/tag/%40smartthings%2Fcli%401.8.1). 
First, we need to create a definition for the device profile. You can find it under `step_02/deviceprofile.json`.

```json
{
	"name": "My WebRTC Camera",
	"metadata": {
		"vid": "03e80c0d-afc5-3c58-a66b-e796e4094946",
		"mnmn": "SmartThingsCommunity",
		"ocfDeviceType": "oic.d.camera",
		"stunServer": "stun.st-av.net"
	},
	"components": [
		{
			"label": "main",
			"id": "main",
			"capabilities": [
				{
					"id": "motionSensor",
					"version": 1,
					"ephemeral": false
				},
				{
					"id": "button",
					"version": 1,
					"ephemeral": false
				},
				{
					"id": "webrtc",
					"version": 1,
					"ephemeral": false
				},
				{
					"id": "imageCapture",
					"version": 1,
					"ephemeral": false
				},
				{
					"id": "healthCheck",
					"version": 1,
					"ephemeral": false
				}
			],
			"categories": [
				{
					"name": "Camera",
					"categoryType": "manufacturer"
				}
			]
		}
	]
}
```

Use the CLI to create the device profile using this JSON.

	$ cd step_2
	$ smartthings deviceprofiles:create -i deviceprofile.json

When you run this command, a device profile is created. Note the id of this device
profile for the next step.

```json
{
    "id": "a86c7dbb-4cc3-47b8-894b-d0715490d82a",
    "name": "My WebRTC Camera",
	...
}
```

Add the given device profile to your `.env` file:

```
DEVICE_PROFILE=a86c7dbb-4cc3-47b8-894b-d0715490d82a
```

Create an exported variable in `utils.js` with the device profile id. Replace the text
`DEVICE_PROFILE_ID_HERE` with the device profile id from the previous step.

```js
module.exports.deviceProfile = () => process.env.DEVICE_PROFILE
```

[Previous](../step_1/STEP_1.md)
[Next](../step_3/STEP_3.md)
