import React from 'react';
import JPEG from './JPEG';
import WebRTC from './WebRTC';

class Stream extends React.Component {
    render() {
        const { name, mqtt } = this.props;
        return (
            <div>
                <JPEG name={name} mqtt={mqtt}></JPEG>
                <WebRTC name={name} mqtt={mqtt}></WebRTC>
            </div>
        );
    }
}

export default Stream;