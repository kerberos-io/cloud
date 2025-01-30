import React from 'react';
import JPEG from './JPEG';
import WebRTC from './WebRTC';

class Stream extends React.Component {

    streamModeOptions = ["jpeg", "webrtc"];

    constructor(props) {
        super(props);
        this.state = {
            streamMode: this.streamModeOptions[1],
        };
    }

    toggleStream = () => {
        this.setState((prevState) => ({
            streamMode: prevState.streamMode === this.streamModeOptions[0] ? this.streamModeOptions[1] : this.streamModeOptions[0]
        }));
    };


    render() {
        const { name, mqtt } = this.props;
        const { streamMode } = this.state;

        const baseStyle = "px-2 py-1 overflow-hidden";
        const selectedStyle = `${baseStyle} bg-gray-800 text-white`;

        return (
            <div>
                <button className="absolute top-2 right-2 text-gray-800 bg-gray-400 bg-opacity-70 rounded-full flex items-center overflow-hidden justify-center text-xs z-50"
                    onClick={this.toggleStream}>
                <span className={(streamMode === this.streamModeOptions[0]) ? selectedStyle : baseStyle}>SD</span>
                <span className={(streamMode === this.streamModeOptions[1]) ? selectedStyle : baseStyle}>HD</span>
                    </button>
                {streamMode=== this.streamModeOptions[0] ? <JPEG name={name} mqtt={mqtt}></JPEG> : <WebRTC name={name} mqtt={mqtt}></WebRTC>}
            </div>
        );
    }
}

export default Stream;