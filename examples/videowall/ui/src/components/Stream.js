import React from 'react';
import JPEG from './JPEG';
import WebRTC from './WebRTC';
import Overlay from './Overlay';
import { STREAM_MODE_OPTIONS } from '../constants/constants';

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

    render() {
        const { name, mqtt, globalStreamMode } = this.props;
        const { streamMode } = this.state;
        return (
            <div className="w-full h-full relative">
                <Overlay name={name} mqtt={mqtt} changeStream={this.changeStream} globalStreamMode={globalStreamMode}></Overlay>
                {streamMode === STREAM_MODE_OPTIONS.JPEG && <JPEG name={name} mqtt={mqtt}></JPEG>} 
                {streamMode === STREAM_MODE_OPTIONS.WEBRTC && <WebRTC name={name} mqtt={mqtt}></WebRTC>}
            </div>
        );
    }
}

export default Stream;