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
    }

    componentDidUpdate(prevProps) {
        if (prevProps.globalStreamMode !== this.props.globalStreamMode) {
            this.setState({ streamMode: this.props.globalStreamMode });
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