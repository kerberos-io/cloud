import React from 'react';
import JPEG from './JPEG';
import WebRTC from './WebRTC';
import { IoIosArrowBack, IoIosArrowDown, IoIosArrowForward, IoIosArrowUp } from "react-icons/io";
import { FaMinus, FaPlus } from "react-icons/fa";
import { VscSettings } from "react-icons/vsc";




class Stream extends React.Component {

    streamModeOptions = ["jpeg", "webrtc"];

    constructor(props) {
        super(props);
        this.state = {
            streamMode: props.globalSteamMode || this.streamModeOptions[1],
        };
    }

    componentDidUpdate(prevProps) {
        if (prevProps.globalStreamMode !== this.props.globalStreamMode) {
            this.setState({ streamMode: this.props.globalStreamMode });
        }
    }

    toggleStream = () => {
        this.setState(prevState => {
            const currentIndex = this.streamModeOptions.indexOf(prevState.streamMode);
            const nextIndex = (currentIndex + 1) % this.streamModeOptions.length;
            return { streamMode: this.streamModeOptions[nextIndex] };
        });
    };


    render() {
        const { name, mqtt } = this.props;
        const { streamMode } = this.state;

        const baseStyle = "px-2 py-1 overflow-hidden";
        const selectedStyle = `${baseStyle} bg-gray-800 text-white`;

        return (
            <div className="w-full">
                <button className="absolute top-2 right-2 text-gray-800/70 bg-gray-400/70 rounded-full flex items-center overflow-hidden justify-center text-xs z-50"
                    onClick={this.toggleStream}>
                    <span className={(streamMode === this.streamModeOptions[0]) ? selectedStyle : baseStyle}>SD</span>
                    <span className={(streamMode === this.streamModeOptions[1]) ? selectedStyle : baseStyle}>HD</span>
                </button>
                <div>
                    <button className="absolute top-1/2 left-1/20 z-50"><IoIosArrowBack /></button>
                    <button className="absolute top-1/2 right-1/20 z-50"><IoIosArrowForward /></button>
                    <button className="absolute top-1/20 left-1/2 z-50"><IoIosArrowUp /></button>
                    <button className="absolute bottom-1/20 left-1/2 z-50"><IoIosArrowDown /></button>
                </div>
                <div className="absolute bottom-2 left-2 z-50 flex flex-col bg-gray-400/50 rounded-md">
                    <button className='flex items-center justify-center p-2'><FaPlus /></button>
                    <button className='flex items-center justify-center p-2'><FaMinus /></button>
                </div>
                <button className="absolute bottom-20 left-2 p-2 z-50"><VscSettings/></button>
                {streamMode=== this.streamModeOptions[0] ? <JPEG name={name} mqtt={mqtt}></JPEG> : <WebRTC name={name} mqtt={mqtt}></WebRTC>}
            </div>
        );
    }
}

export default Stream;