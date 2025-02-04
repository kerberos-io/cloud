import React from 'react';
import JPEG from './JPEG';
import WebRTC from './WebRTC';
import PTZ from './PTZ';
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
        return (
            <div className="w-full h-full min-h-60">
                <PTZ name={name} mqtt={mqtt}></PTZ>
                {streamMode === STREAM_MODE_OPTIONS.JPEG && <JPEG name={name} mqtt={mqtt}></JPEG>} 
                {streamMode === STREAM_MODE_OPTIONS.WEBRTC && <WebRTC name={name} mqtt={mqtt}></WebRTC>}
            </div>
        );
    }
}

export default Stream;