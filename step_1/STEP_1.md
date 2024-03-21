# Step 1: Create an OAuth 2.0 app

We begin by creating an OAuth 2.0 application. For this tutorial, a simple Oauth 2.0 application is provided in the `Step 1` directory.
This app will stand in for your OAuth 2.0 application.

> This sample app stores data in a SQLite database in the `.data` directory.


**NOTE**: To run the connector, you will need to make it accessible to the Internet. We recommend using a program
like [ngrok](https://ngrok.com/) to do this, rather than opening ports to you computer in your router setup.
To use ngrok, you'll need to install it and create an account before following the steps listed below.


## Get started

Start by cloning the repository below:

	git clone https://github.com/SmartThingsCommunity/webrtc-tutorial.git

Copy the contents of `oauth_app` into your working directory (in this case, `my_schema_integration`):

	cp -pr oauth_app my_schema_integration

Next, navigate to your working directory and install dependencies:

	cd my_schema_integration/oauth_app
	npm install

Start ngrok (or your preferred tunneling service) forwarding to `port 3000` (the default port for the server).
If you are using ngrok, note the forwarding URL for use as the `SERVER_URL` in the next step (it will be provided an `https` URL).

	# example using ngrok
	$ ngrok http 3000

Generate your own `CLIENT_ID` and `CLIENT_SECRET` to use in the example below (an online UUID-generator is a
good place to get values). Additionally, create a username and password for the single
sample user of this example app.

Create a `.env` file in your working directory with the following variables, substituting your own values for each of them:

```
SERVER_URL=https://963f3b10c014.ngrok.app
CLIENT_ID=somerandomstring
CLIENT_SECRET=someotheroftenlongrandomstring
APP_USERNAME=yourusername
APP_PASSWORD=yourpassword
```

Start your app:

	npm start

## Test your app

Open the forwarding URL in your browser (we tested with Chrome) and sign in using the username
and password you specified in the `.env` file. There is no connection to SmartThings yet but
you can start the camera, simulate a doorbell ring, and simulate motion. You should see log
messages in the console when you take these actions.

Once you have verified that your app is properly running, you are ready to move to [step 2](../step_2/STEP_2.md).
