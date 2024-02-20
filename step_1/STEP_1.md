# Step 1 - A Simple OAuth 2.0 App

Your cloud must support OAuth 2.0 (including authorization code flow) so the first step is to have
an OAuth 2 application. For this tutorial, we are providing a simple Oauth 2.0 application in Step 1
which will stand in for your application. This is the starting point for this tutorial. Details of
how it works are beyond the scope of this tutorial.

This starter app stores data in a SQLite database in the `.data` directory.

## Get it Running

To run the connector, you will need to make it accessible to the Internet. We recommend using a program
like [ngrok](https://ngrok.com/) to do this, rather than opening ports to you computer in your router setup.

Start by cloning the repository below:

	git clone https://github.com/SmartThingsCommunity/webrtc-tutorial.git

Next, navigate to the project directory and install dependencies:

	cd webrtc-tutorial/step_1
	npm install

Start ngrok (or your preferred tunneling service) forwarding to port 3000 (the default port for the server).
If you are using ngrok, note the forwarding URL for use in the next step. (It will be an `https` URL.)

	# example using ngrok
	$ ngrok http 3000

Make up your own client id and secret to use in the example below. An online UUID-generator is a
good place to get values to use in this example. Make up a username and password for the single
sample user of this example app.

Create a `.env` file with the following variables, substituting your own values for each of them:

```
SERVER_URL=https://963f3b10c014.ngrok.app
CLIENT_ID=somerandomstring
CLIENT_SECRET=someotheroftenlongrandomstring
USERNAME=yourusername
PASSWORD=yourpassword
```

Start the server:

	npm start

## Kick the Tires (Test It Out)

Open the forwarding URL in your browser (we tested with Chrome) and sign in using the username
and password you specified in the `.env` file. There is no connection to SmartThings yet but
you can start the camera, simulate a doorbell ring, and simulate motion. You should see log
messages in the console when you take these actions.

[Next](../step_2/STEP_2.md)
