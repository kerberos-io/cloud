# Example: live streaming HD

Hub provides two types of live view: a low resolution live view and a high resolution (on demand) live view. Depending on the situation you might leverage one over the other, or, both. Below we will explain the differences, and how to open and negotiate a high resolution live view with the agent. It's important to understand that live view is an on-demand action, which requires a negotiation between the requesting client (Hub or your application) and the remote agent. This negotiation will setup a live view sessions between the client and the agent, for a short amount of time. Once the client closes the connection, the agent will stop forwarding the live view.

## High resolution

Hub and Agent provides a high resolution live view, which includes a full-frames-per-second (FPS) stream. To allow this the WebRTC protocol has been used for setting up the communication (ICE candidates) and forward the stream. Please see below graphic for more details.

![Livestreaming HD](./livestreaming-hd.svg)

The negotiation of a live view is a multi-step approach, we'll detail each step below.

1.  Setup connection: before moving on your app should be able to communicate and authenticate with MQTT message broker, using the relevant credentials of your MQTT broker.

2.  Request for stream: Your application will reach out to MQTT message broker (e.g. Vernemq or Mosquitto) by requesting a HD session. This topic includes the `hubKey`, indicating the Hub user account to which the camera belongs.

    - Publish to `kerberos/agent/{hubKey}` topic, this is what the agent is listening to.
    - The payload of the message is of following format, and send to previously mentioned `topic`.
    - The agent will receive the payload on the expected `hubKey` and validates the `device_id` to verify the message receiver.
    - Once validated the agent, will validate the action `request-hd-stream` and execute the desired function (where in this scenario it will share an WebRTC answer).

             const payload = {
                 mid: "xxxx",
                 timestamp: "xxxx",
                 device_id: this.deviceKey,
                 hidden: false,
                 payload: {
                     action: "request-hd-stream",
                     device_id: this.deviceKey,
                     value: {
                         timestamp: Math.floor(Date.now() / 1000),
                         session_id: this.cuuid,
                         session_description: btoa(this.pc.localDescription.sdp),
                     }
                 }
             };

3.  Once the agent receives the request for HD streaming it will generate a WebRTC answer sent to the following topic `kerberos/hub/{hubKey}`, with a similar payload as previously mentioned but with a different `action` and `value`.

    - Following payload will be send to `kerberos/hub/{hubKey}`.

           const payload = {
               mid: "xxxx",
               timestamp: "xxxx",
               device_id: this.deviceKey,
               hidden: false,
               payload: {
                   action: "receive-sd-stream",
                   device_id: this.deviceKey,
                   value: {
                       image: "/3223535--base64-encode-string....--ewgewg/"
                   }
               }
           };

    - The payload of the consumed messages will include a base64 encoded image, which can be visualised through embedding in a `<img>` HTML component.

. In this case sharing the available and possible routes to transfer the stream between the agent and hub (also called ICE candidates).

4.  Close stream: your application stops sending "keep-alive" request for stream (1), the targetted agent will stop sending JPEGs to the relative MQTT topic (2), for which the live view is closed.

## Example

In the `ui` folder a React application is added which contains a working example using our [`demo enviroment`](https://app-demo.kerberos.io). To run the project, install the dependencies and run the project using `npm install`.

    cd ui/
    npm install
    npm start
