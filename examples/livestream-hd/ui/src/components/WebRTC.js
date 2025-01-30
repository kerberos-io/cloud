import React from 'react';
import { v4 as uuidv4 } from "uuid";

class WebRTC extends React.Component {

    constructor() {
        super();
        this.videoRef = React.createRef();
        this.sessionId = uuidv4();
    }

    componentDidMount() {
        const { mqtt, name } = this.props;
        this.name = name;
        this.mqtt = mqtt;

        this.peerConnection = new RTCPeerConnection({
            iceServers: [
                { urls: 'stun:turn.xxx.xx:8443' },
                { urls: 'turn:turn.xxx.xx:8443', username: 'xxxxxxx', credential: 'xxxxxx' }
            ]
        });

        this.peerConnection.onicecandidate = this.handleICECandidateEvent.bind(this);
        this.peerConnection.ontrack = this.handleTrackEvent.bind(this);
        this.peerConnection.onnegotiationneeded = this.handleNegotiationNeededEvent.bind(this);
        this.peerConnection.oniceconnectionstatechange = this.handleICEConnectionStateChangeEvent.bind(this);
        this.peerConnection.onsignalingstatechange = this.handleSignalingStateChangeEvent.bind(this);
        this.peerConnection.onicegatheringstatechange = this.handleICEGatheringStateChangeEvent.bind(this);
        this.peerConnection.onconnectionstatechange = this.handleConnectionStateChangeEvent.bind(this);

        this.peerConnection.addTransceiver("video", {
          direction: "sendrecv",
        });
        this.peerConnection.addTransceiver("audio", {
          direction: "sendrecv",
        });
        // We need to subscribe to the specific agent to receive the ICECandidate.
        // Upon receiving the ICECandidate, we'll add it to the peerConnection.
        this.subscribe();
    }

    subscribe() {
        // We're listening for the "receive-hd-candidate" action for the specific
        // camera (all other actions are ignored).
        // Each time we receive a message with this action, we update the liveview state.
        this.mqtt.on(this.name, (_, message) => {
            const { payload } = message;
            if (payload.action === "receive-hd-candidates" && this.peerConnection.remoteDescription) {
                let { candidate } = payload.value;
                candidate = JSON.parse(candidate.toString());
                this.peerConnection.addIceCandidate(candidate);
            } else if (payload.action === 'receive-hd-answer') {
                const { sdp, session_id } = payload.value;
                if (session_id === this.sessionId) {
                    this.peerConnection.setRemoteDescription(new RTCSessionDescription({
                        type: 'answer',
                        sdp: atob(atob(sdp)),
                    }));
                }
            }
        });
    }

    handleICECandidateEvent(event) {
        if (event.candidate) {
            // Handle ICE candidate event
            const { candidate } = event.candidate;
            const payload = {
                action: "receive-hd-candidates",
                device_id: this.name,
                value: {
                  timestamp: Math.floor(Date.now() / 1000),
                  session_id: this.sessionId,
                  candidate: candidate,
                }
            };
            this.mqtt.publish(payload);
        }
    }

    handleNegotiationNeededEvent() {
        // In here we'll create an offer and send it to the other peer.
        return this.peerConnection.createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: true,
            iceRestart: true,
        }).then(offer => {
            return this.peerConnection.setLocalDescription(offer);
        }).then(() => {
            this.sendOffer();
        }).catch(error => console.log(error));
    }

    sendOffer(){
        const { sdp } = this.peerConnection.localDescription;
        const payload = {
            action: "request-hd-stream",
            device_id: this.name,
            value: {
                timestamp: Math.floor(Date.now() / 1000),
                session_id: this.sessionId,
                session_description: btoa(sdp),
            }
        };
        this.mqtt.publish(payload);
    }

    handleConnectionStateChangeEvent() {
        if (this.peerConnection.connectionState === 'connected') {
            console.log('connected');
            const videoElement = this.videoRef.current;
            if (videoElement) {
                videoElement.play();
            }
        }
    }

    handleTrackEvent(event) {
        const videoElement = this.videoRef.current;
        if (videoElement) {
            videoElement.srcObject = event.streams[0];
        }
    }

    handleICEConnectionStateChangeEvent() {
        // Handle ICE connection state change event
    }

    handleSignalingStateChangeEvent() {
        // Handle signaling state change event
    }

    handleICEGatheringStateChangeEvent() {
        // Handle ICE gathering state change event
    }

    render(){
        return (
            <video style={{width: "100%"}} ref={this.videoRef} muted controls></video>
        );
    }
}

export default WebRTC;