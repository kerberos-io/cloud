import React from 'react';
import { IoIosArrowBack, IoIosArrowDown, IoIosArrowForward, IoIosArrowUp } from "react-icons/io";
import { FiMinus, FiPlus } from "react-icons/fi";
import { VscSettings } from "react-icons/vsc";
import { RiFullscreenLine } from "react-icons/ri";
import { DIRECTIONS, STREAM_MODE_OPTIONS, ZOOM_OPTIONS } from '../constants/constants';

class PTZ extends React.Component {

    componentDidMount() {
        const { mqtt, name } = this.props;
        this.mqtt = mqtt;
        this.name = name;

        // To start receiving messages, we need to send heartbeats to the topic: kerberos/agent/{hubKey}
        // This will wakeup the desired agents, and they will start sending JPEGS to the kerberos/hub/{hubKey} topic.
        this.intervalId = setInterval(() => {
           this.publish();
        }, 3000);

        // We need to subscribe to the specific camera to receive the liveview.
        // After the request-sd-stream action is sent, the agent will start sending 
        // JPEGS to the kerberos/hub/{hubKey} topic.
        this.subscribe();
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


    render(){
        const baseStyle = "px-2 py-1 overflow-hidden";
        const selectedStyle = `${baseStyle} bg-gray-800 text-white`;
        const { streamMode } = this.props;
        return (
            <div>
                <div className="absolute top-2 right-2 text-gray-800/70 bg-gray-400/70 rounded-full flex items-center overflow-hidden justify-center text-xs z-50">
                    <button className={(streamMode === STREAM_MODE_OPTIONS.JPEG) ? selectedStyle : baseStyle}  onClick={() => this.changeStream(STREAM_MODE_OPTIONS.JPEG)}>SD</button>
                    <button className={(streamMode === STREAM_MODE_OPTIONS.WEBRTC) ? selectedStyle : baseStyle} onClick={() => this.changeStream(STREAM_MODE_OPTIONS.WEBRTC)}>HD</button>
                </div>
                <div>
                    <button className="absolute top-1/2 left-1/20 p-2 rounded-full hover:bg-gray-400/40 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" onClick={() => this.move(DIRECTIONS.LEFT)}><IoIosArrowBack /></button>
                    <button className="absolute top-1/2 right-1/20 p-2 rounded-full hover:bg-gray-400/40 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" onClick={() => this.move(DIRECTIONS.RIGHT)}><IoIosArrowForward /></button>
                    <button className="absolute top-1/20 left-1/2 p-2 rounded-full hover:bg-gray-400/40 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" onClick={() => this.move(DIRECTIONS.UP)}><IoIosArrowUp /></button>
                    <button className="absolute bottom-1/20 left-1/2 p-2 rounded-full hover:bg-gray-400/40 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" onClick={() => this.move(DIRECTIONS.DOWN)}><IoIosArrowDown /></button>
                </div>
                <div className="absolute bottom-2 left-2 z-50 flex flex-col overflow-hidden rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button className='flex items-center justify-center p-2 bg-gray-400/50 hover:bg-gray-400/70' onClick={() => this.zoom(ZOOM_OPTIONS.IN)}><FiPlus /></button>
                    <button className='flex items-center justify-center p-2 bg-gray-400/50 hover:bg-gray-400/70' onClick={() => this.zoom(ZOOM_OPTIONS.OUT)}><FiMinus /></button>
                </div>
                <button className="absolute bottom-20 left-2 z-50 p-2 rounded-md hover:bg-gray-400/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300"><VscSettings /></button>
                <button className="absolute bottom-2 right-2 z-50 p-2 rounded-md hover:bg-gray-400/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300"><RiFullscreenLine /></button>
            </div>
        );
    }
}

export default PTZ;