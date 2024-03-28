# Overview

This tutorial demonstrates how to create a SmartThings Schema integration that 
enables you to add a webcam to your SmartThings account. The integration 
creates a single camera device that can be used to view the webcam's video stream from within the SmartThings app.

This tutorial is divided into five unique steps. Instructions for each step can be found in each `step_<n>` subdirectory.

> **⚠️ IMPORTANT**: Code provided in steps 2 and later in each `sample_files` directory is for *reference only* and is not intended to be a pre-configured standalone solution. Each step builds on the previous step's sample files - when you finish following instructions for a given step, the code in your working directory should resemble the code examples and files provided in each step's `sample_files` directory.

# Prerequisites

1. Basic familiarity with NodeJS and TypeScript 
1. A [Samsung account](https://developer.smartthings.com/).
1. The [SmartThings CLI](https://github.com/SmartThingsCommunity/smartthings-cli/tree/main/packages/cli) installed and configured for your Samsung account. If you have not yet configured the CLI for use with your Samsung account, you will be prompted to do so when running the CLI for the first time. 
1. A computer running MacOS, Windows, or Linux.
1. A webcam connected to your computer.
1. NodeJS version 20.

# Tutorial

* [Step 1: Get started with a pre-existing OAuth app](step_1/STEP_1.md)
* [Step 2: Create a device profile](step_2/STEP_2.md)
* [Step 3: Register your Schema integration](step_3/STEP_3.md)
* [Step 4: Implement a ring button](step_4/STEP_4.md)
* [Step 5: Add your camera](step_5/STEP_5.md)

# References

* [Get Started with Cloud Connected Devices](https://developer.smartthings.com/docs/devices/cloud-connected/get-started)
* [Get Started with SmartThings Schema](https://developer.smartthings.com/docs/devices/cloud-connected/st-schema)
* [Device Profiles](https://developer.smartthings.com/docs/devices/device-profiles/)
* [st-schema NodeJS library](https://github.com/SmartThingsCommunity/st-schema-nodejs)
