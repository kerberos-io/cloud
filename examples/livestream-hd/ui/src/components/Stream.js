import React from 'react';
import JPEG from './JPEG';
import WebRTC from './WebRTC';
import { IoIosArrowBack, IoIosArrowDown, IoIosArrowForward, IoIosArrowUp } from "react-icons/io";
import { FiMinus, FiPlus } from "react-icons/fi";

import { VscSettings } from "react-icons/vsc";
import { RiFullscreenLine } from "react-icons/ri";
import { DIRECTIONS, STREAM_MODE_OPTIONS, ZOOM_OPTIONS } from '../constants/constants';



class Stream extends React.Component {

    streamModeOptions = ["jpeg", "webrtc"];

    constructor(props) {
        super(props);
        this.state = {
            streamMode: props.globalSteamMode || STREAM_MODE_OPTIONS.WEBRTC
        };
    }

    componentDidUpdate(prevProps) {
        if (prevProps.globalStreamMode !== this.props.globalStreamMode) {
            this.setState({ streamMode: this.props.globalStreamMode });
        }
    }

    changeStream = (streamMode) => {
        this.setState({ streamMode: streamMode });
    };

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

    render() {
        const { name, mqtt } = this.props;
        const { streamMode } = this.state;

        const baseStyle = "px-2 py-1 overflow-hidden";
        const selectedStyle = `${baseStyle} bg-gray-800 text-white`;

        return (
            <div className="w-full min-h-60 border-2 border-red-500">
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
                {/* {streamMode === STREAM_MODE_OPTIONS.JPEG && <JPEG name={name} mqtt={mqtt}></JPEG>} 
                {streamMode === STREAM_MODE_OPTIONS.WEBRTC && <WebRTC name={name} mqtt={mqtt}></WebRTC>} */}
            </div>
        );
    }
}

export default Stream;