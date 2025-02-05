# Videowall

This repository contains a comprehensive video wall implementation that brings together various advanced features demonstrated in other examples within this repository. The video wall supports both high-definition (HD) and standard-definition (SD) live streaming, ensuring flexibility and adaptability to different streaming quality requirements. Additionally, it includes pan-tilt-zoom (PTZ) functionality, allowing users to dynamically adjust the viewing angle and zoom level for a more interactive and detailed surveillance experience. This integration of multiple features makes the video wall a versatile and powerful tool for monitoring and security applications.

## Features

As explained above, this example integrates several advanced features showcased in other parts of this repository. Each feature is designed to enhance the overall functionality and user experience of the video wall. For more detailed information on how each feature works, please refer to the respective sections within this repository:

- **Standard-Definition Livestream**: Provides a reliable and efficient way to stream video in standard definition, suitable for scenarios where bandwidth is limited or high-definition is not required. [Learn more](../livestream-sd)
- **High-Definition Livestream**: Delivers high-quality video streaming, ensuring clear and detailed visuals for critical monitoring tasks. [Learn more](../livestream-hd)
- **Pan-Tilt-Zoom (PTZ)**: Offers dynamic control over the camera's viewing angle and zoom level, enabling users to focus on specific areas of interest and obtain a more comprehensive view. [Learn more](../onvif-ptz)

## Example

In the `ui` folder a React application is created implementing the above feature, which contains a working example using our [`demo enviroment`](https://app-demo.kerberos.io). To run the project, install the dependencies and run the project using `npm install`.

    cd ui/
    npm install
    npm start
