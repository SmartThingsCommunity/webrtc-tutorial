# Overview

:warning: DRAFT This tutorial is a rough first draft.

This tutorial will walk you through creating a SmartThings Schema which adds a web camera as a
device to your SmartThings account.

The application creates a single camera device that can be used to view the webcam's video stream
and integrate this video stream with SmartThings for viewing in the SmartThings app.

Individual steps in this tutorial can be found in `step_<n>` subdirectories. It is recommended
that you start with the simple OAuth 2.0 application provided in step 1 and proceed from there.
Code provided in steps 2 and later is for reference only. (When you finish following the instructions
in a given step, your code should end up looking like the code in that step.)

# Prerequisites

1. A [Samsung developer account](https://developer.smartthings.com/)
2. The [SmartThings CLI](https://github.com/SmartThingsCommunity/smartthings-cli/tree/main/packages/cli) installed and configured for your developer account
3. A webcam connected to your computer
4. NodeJS version 20.

# Tutorial

* [Step 1 - A Simple OAuth 2.0 App](step_1/STEP_1.md)
* [Step 2 - Create a Device Profile](step_2/STEP_2.md)
* [Step 3 - Register Your Connector](step_3/STEP_3.md)
* [Step 4 - Initial Schema Setup and Ring Button](step_4/STEP_4.md)
* [Final Step - Full Connector](step_final/STEP_FINAL.md)

# References

* [Get Started with Cloud Connected Devices](https://developer.smartthings.com/docs/devices/cloud-connected/get-started)
* [Get Started with SmartThings Schema](https://developer.smartthings.com/docs/devices/cloud-connected/st-schema)
* [Device Profiles](https://developer.smartthings.com/docs/devices/device-profiles/)
* [st-schema NodeJS library](https://github.com/SmartThingsCommunity/st-schema-nodejs)
