/* global $ */
const servers = {
	iceServers: [
		{
			urls: ['stun:stun.st-av.net:19302'],
		},
	],
	iceCandidatePoolSize: 10,
}
let webcamVideo = null
let pc = null
let videoStream = null

// eslint-disable-next-line no-unused-vars
const processOffer = async (args) => {
	const offer = {
		type: 'offer',
		sdp: args[1],
	}

	console.log('SDP OFFER =', JSON.stringify(offer, null, 2))
	await pc.setRemoteDescription(new RTCSessionDescription(offer))

	const answerDescription = await pc.createAnswer()
	await pc.setLocalDescription(answerDescription)

	const answer = {
		type: answerDescription.type,
		sdp: answerDescription.sdp,
	}

	post('/api/answer', {sdp: answer.sdp,id : args[0]}).then(async (response) => {
		if (response.ok) {
			console.log('SDP ANSWER =', JSON.stringify(answer, null, 2))

			pc.onicecandidate = (event) => {
				console.log('DEVICE ICE CANDIDATE =', JSON.stringify(event.candidate, null, 2))
				if (event.candidate) {
					post('/api/deviceIce', event.candidate).then(async (response) => {
						if (!response.ok) {
							console.log('Error posting device ICE', response.status, response.statusText)
						}
					})
				}
			}
		} else {
			console.log('Error posting image', response.status, response.statusText)
		}
	})
}

const startWebcam = async () => {
	const ctrl = $('#webcamStartButton')
	ctrl.addClass('processing')
	ctrl.attr('disabled', true)

	pc = new RTCPeerConnection(servers)

	videoStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })

	// Push tracks from local stream to peer connection
	videoStream.getTracks().forEach((track) => {
		pc.addTrack(track, videoStream)
	})

	webcamVideo.srcObject = videoStream

	$('#webcamStopButton').show()
	ctrl.removeClass('processing')
	ctrl.hide()

	/*
	const eventSource = new EventSource('/stream')
	eventSource.onmessage = async (e) => {
		const cmd = JSON.parse(e.data)
		if (cmd.command === 'sdpOffer') {
			await processOffer(cmd.arguments)
		} else if (cmd.command === 'clientIce') {
			const candidate = cmd.arguments[1]
			console.log('CLIENT CANDIDATE =', JSON.stringify(candidate, null, 2))
			await pc.addIceCandidate(new RTCIceCandidate(candidate))
		} else if (cmd.command === 'take') {
			await captureImage()
		}
	}

	eventSource.onerror = (e) => console.log('EventSource failed %j', e)
	*/
}

const stopWebcam = async () => {
	const ctrl = $('#webcamStopButton')
	const startCtrl = $('#webcamStartButton')
	ctrl.addClass('processing')
	if (videoStream) {
		videoStream.getTracks().forEach((track) => {
			track.stop()
		})
		videoStream = null
		webcamVideo.srcObject = null
	}
	ctrl.removeClass('processing')
	ctrl.hide()
	startCtrl.attr('disabled', false)
	startCtrl.show()
	await post('/api/online', {value: 'offline'})
}

// eslint-disable-next-line no-unused-vars
const captureImage = async () => {
	const canvas = document.getElementById('canvas')
	const context = canvas.getContext('2d')
	canvas.width = webcamVideo.videoWidth
	canvas.height = webcamVideo.videoHeight
	context.drawImage(webcamVideo, 0, 0, canvas.width, canvas.height)
	await canvas.toBlob(async (blob) => {
		const formData = new FormData()
		formData.append('image', blob, 'image.jpg')

		const response = await fetch('/api/capture', {
			method: 'POST',
			body: formData,
		})

		if (response.ok) {
			// Request was successful, handle response
			const data = await response.json()
			console.log(data.url) // or response.json() if expecting JSON
		} else {
			console.log('Error posting image', response.status, response.statusText)
		}
	},'image/jpeg', 0.8)
}

const post = (url, data) => {
	return fetch(url, {
		method: 'POST',
		body: data !== undefined ? JSON.stringify(data) : undefined,
		headers: {
			'Content-Type': 'application/json'
		}
	})
}

$(document).ready(() => {
	webcamVideo = document.getElementById('webcamVideo')

	fetch('/api/status').then(async (response) => {
		if (response.ok) {
			const data = await response.json()
			if (data.motion === 'active') {
				$('#motionInactiveButton').hide()
			} else {
				$('#motionActiveButton').hide()
			}
			$('#webcamStopButton').hide()
			$('.controls').show()
		} else {
			console.log('Error getting camera', response.status, response.statusText)
		}
	})

	$('#webcamStartButton').click(async () => await startWebcam())

	$('#webcamStopButton').click(async () => await stopWebcam())

	$('#ringBellButton').click(async function() {
		const ctrl = $(this)
		ctrl.addClass('processing')
		post('/api/ring').then(async (response) => {
			if (response.ok) {
				ctrl.removeClass('processing')
			} else {
				console.log('Error ringing bell', response.status, response.statusText)
			}
		})
	})

	$('#motionInactiveButton').click(async function() {
		const ctrl = $(this)
		ctrl.addClass('processing')
		post('/api/motion', { value: 'active' }).then(async (response) => {
			if (response.ok) {
				ctrl.removeClass('processing')
				ctrl.hide()
				$('#motionActiveButton').show()
			} else {
				console.log('Error ringing bell', response.status, response.statusText)
			}
		})
	})

	$('#motionActiveButton').click(async function() {
		const ctrl = $(this)
		ctrl.addClass('processing')
		post('/api/motion', { value: 'inactive' }).then(async (response) => {
			if (response.ok) {
				ctrl.removeClass('processing')
				ctrl.hide()
				$('#motionInactiveButton').show()
			} else {
				console.log('Error ringing bell', response.status, response.statusText)
			}
		})
	})
})
