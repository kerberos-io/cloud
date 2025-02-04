import React from 'react';
import PTZ from './PTZ';
import { VscSettings } from "react-icons/vsc";
import { RiFullscreenLine } from "react-icons/ri";
import { DIRECTIONS, STREAM_MODE_OPTIONS, ZOOM_OPTIONS } from '../constants/constants';

class Overlay extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            streamMode: this.props.globalStreamMode
        };
    }

    componentDidMount() {
        const { mqtt, name } = this.props;
        this.mqtt = mqtt;
        this.name = name;

        // To start receiving messages, we need to send heartbeats to the topic: kerberos/agent/{hubKey}
        // This will wakeup the desired agents, and they will start sending JPEGS to the kerberos/hub/{hubKey} topic.
        this.publish();

        // We need to subscribe to the specific camera to receive the liveview.
        // After the request-sd-stream action is sent, the agent will start sending 
        // JPEGS to the kerberos/hub/{hubKey} topic.
        this.subscribe();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.globalStreamMode !== this.props.globalStreamMode) {
            this.setState({ streamMode: this.props.globalStreamMode });
        }
    }

    componentWillUnmount() {
        clearInterval(this.intervalId);
    }

    subscribe() {
        // We're listening for the "receive-sd-stream" action for the specific
        // camera (all other actions are ignored).
        // Each time we receive a message with this action, we update the liveview state.
        this.mqtt.on(this.name, (_, message) => {
            const { payload } = message;
            if (payload.action === "receive-sd-stream") {
                const { value } = payload;
                this.setState({
                    liveview: value.image
                });
            }
        });
    }

    publish() {
        const payload = {
            action: "request-sd-stream",
            device_id: this.name,
            value: {
                timestamp: Math.floor(Date.now() / 1000),
            }
        };
        this.mqtt.publish(payload);
    }

    zoom = (zoomDirection = ZOOM_OPTIONS.IN) => {
        if (zoomDirection === ZOOM_OPTIONS.IN) {
            console.log("Zoom In");
        } else {
            console.log("Zoom Out");
        }
    };

    move = (direction = DIRECTIONS.UP) => {
        switch (direction) {
            case DIRECTIONS.UP:
                console.log("Move Up");
                break;
            case DIRECTIONS.DOWN:
                console.log("Move Down");
                break;
            case DIRECTIONS.LEFT:
                console.log("Move Left");
                break;
            case DIRECTIONS.RIGHT:
                console.log("Move Right");
                break;
            default:
                break;
        }
    }

    changeStream = (streamMode) => {
        if(this.props.changeStream){
            this.props.changeStream(streamMode);
            this.setState({ streamMode });
        }
    }

    render(){
        const baseStyle = "px-2 py-1 overflow-hidden";
        const selectedStyle = `${baseStyle} bg-gray-800 text-white`;
        const { streamMode } = this.state;
        const buttonStyle = "p-2 rounded-full hover:bg-gray-400/40 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300";
        const streamButtonContainerStyle = "absolute top-2 right-2 text-gray-800/70 bg-gray-400/70 rounded-full flex items-center overflow-hidden justify-center text-xs z-50";
        return (
            <div>
                <div className={streamButtonContainerStyle}>
                    <button className={(streamMode === STREAM_MODE_OPTIONS.JPEG) ? selectedStyle : baseStyle} 
                            onClick={() => this.changeStream(STREAM_MODE_OPTIONS.JPEG)}>SD</button>
                    <button className={(streamMode === STREAM_MODE_OPTIONS.WEBRTC) ? selectedStyle : baseStyle} 
                            onClick={() => this.changeStream(STREAM_MODE_OPTIONS.WEBRTC)}>HD</button>
                </div>
                <PTZ name={this.name} mqtt={this.mqtt}></PTZ>
                <button className={`absolute bottom-20 left-2 ${buttonStyle}`}><VscSettings /></button>
                <button className={`absolute bottom-2 right-2 ${buttonStyle}`}><RiFullscreenLine /></button>
            </div>
        );
    }
}

export default Overlay;