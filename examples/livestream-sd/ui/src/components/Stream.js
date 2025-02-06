import React from 'react';
import JPEG from './JPEG';

class Stream extends React.Component {

    streamModeOptions = ["jpeg", "webrtc"];

    render() {
        const { name, mqtt } = this.props;
        return (
            <div className="w-full h-full relative">
                <JPEG name={name} mqtt={mqtt}></JPEG>
            </div>
        );
    }
}

export default Stream;