# Step 2: Create a device profile

Devices on the SmartThings platform use [device profiles](https://developer.smartthings.com/docs/devices/device-profiles/) to define device features and functionality on the platform. 

You will need to create a [device profile](https://developer.smartthings.com/docs/devices/device-profiles/) for your camera device before joining it with the SmartThings platform. In this step, we will use the CLI and a predefined device definition to create a device profile. 

## Create your device definition and device profile 

First, we need to create a definition for the device profile.
You can find a predefined definition in `step_02/sample_files/deviceprofile.json`:

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

Use the CLI to create a new device profile using the provided JSON:

	$ cd step_2/sample_files
	$ smartthings deviceprofiles:create -i deviceprofile.json

Record the `id` of your device profile for use in the next step.

> **NOTE**: The `id` provided below is for illustrative purposes only. You will receive a unique `id` after creating your device profile. 

```json
{
    "id": "a86c7dbb-4cc3-47b8-894b-d0715490d82a",
    "name": "My WebRTC Camera",
	...
}
```

## Add the device profile to your `.env` file:

```
DEVICE_PROFILE=a86c7dbb-4cc3-47b8-894b-d0715490d82a
```

Create an exported variable in `utils.js` with the device profile ID. Replace the text
`DEVICE_PROFILE_ID_HERE` with the device profile ID from the previous step.

```js
module.exports.deviceProfile = () => process.env.DEVICE_PROFILE
```

After creating your device profile and adding it to your `.env` file, you are ready to move to [step 3](../step_3/STEP_3.md)
