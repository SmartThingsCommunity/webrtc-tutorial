module.exports.serverUrl = () => {
	if (process.env.PROJECT_DOMAIN) {
		return `https://${process.env.PROJECT_DOMAIN}.glitch.me`
	}
	return process.env.SERVER_URL || `http://localhost:${process.env.PORT || 3000}`
}

module.exports.deviceId = () => 'webcam1'

module.exports.deviceState = (healthStatus, motionSensor) => [
	{
		component: 'main',
		capability: 'st.healthCheck',
		attribute: 'healthStatus',
		value: healthStatus
	},
	{
		component: 'main',
		capability: 'st.motionSensor',
		attribute: 'motion',
		value: motionSensor
	},
	{
		component: 'main',
		capability: 'st.button',
		attribute: 'supportedButtonValues',
		value: ['pushed']
	},
	{
		component: 'main',
		capability: 'st.webrtc',
		attribute: 'stunUrl',
		value: 'stun:stun.st-av.net'
	},
	{
		component: 'main',
		capability: 'st.webrtc',
		attribute: 'audioOnly',
		value: false
	},
	{
		component: 'main',
		capability: 'st.webrtc',
		attribute: 'supportedFeatures',
		value: {
			'audio': 'sendrecv',
			'video': 'recvonly',
			'bundle': false,
			'order': 'audio/video'
		}
	},
	{
		component: 'main',
		capability: 'st.webrtc',
		attribute: 'talkback',
		value: false
	}
]
