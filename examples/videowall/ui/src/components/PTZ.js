import React, { act } from 'react';
import { IoIosArrowBack, IoIosArrowDown, IoIosArrowForward, IoIosArrowUp } from "react-icons/io";
import { FiMinus, FiPlus } from "react-icons/fi";
import { DIRECTIONS, ZOOM_OPTIONS } from '../constants/constants';

class PTZ extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            streamMode: this.props.globalStreamMode
        };
    }

    componentDidMount() {
        const { mqtt, name } = this.props;
        this.mqtt = mqtt;
        console.log('Overlay MQTT: ', mqtt);
        this.name = name;
    }

    componentDidUpdate(prevProps) {
        if (prevProps.mqtt !== this.props.mqtt) {
            this.mqtt = this.props.mqtt;
        }
        if (prevProps.name !== this.props.name) {
            this.name = this.props.name;
        }
    }

    zoom = (zoomDirection = ZOOM_OPTIONS.IN) => {
        const action = {
            action: "zoom",
            payload: {
                zoom: 0,
            }
        };

        if (zoomDirection === ZOOM_OPTIONS.IN) {
            action.payload.zoom = 1;
            this.publish(action);
        } else {
            action.payload.zoom = -1;
            this.publish(action);
        }
    };

    move = (direction = DIRECTIONS.UP) => {
        const action = {
            action: "ptz",
            payload: {
              up: 0,
              down: 0,
              left: 0,
              right: 0,
              center: 0,
            }
        };

        switch (direction) {
            case DIRECTIONS.UP:
                action.payload.up = 1;
                this.publish(action);
                break;
            case DIRECTIONS.DOWN:
                action.payload.down = 1;
                this.publish(action);
                break;
            case DIRECTIONS.LEFT:
                action.payload.left = 1;
                this.publish(action);
                break;
            case DIRECTIONS.RIGHT:
                action.payload.right = 1;
                this.publish(action);
                break;
            default:
                break;
        }
    }

    publish(action) {
        const payload = {
            action: "navigate-ptz",
            device_id: this.name,
            value: {
                timestamp: Math.floor(Date.now() / 1000),
                action: JSON.stringify(action)
            }
        };
        this.mqtt.publish(payload);
    }

    render(){
        const buttonStyle = "p-2 rounded-full hover:bg-gray-400/40 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300";
        const zoomButtonStyle = "flex items-center justify-center p-2 bg-gray-400/50 hover:bg-gray-400/70";
        const controlButtonContainerStyle = "absolute bottom-2 left-2 z-50 flex flex-col overflow-hidden rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300";

        return (
            <div>       
                <div>
                    <button className={`absolute top-1/2 left-1/20 ${buttonStyle}`} onClick={() => this.move(DIRECTIONS.LEFT)}><IoIosArrowBack /></button>
                    <button className={`absolute top-1/2 right-1/20 ${buttonStyle}`} onClick={() => this.move(DIRECTIONS.RIGHT)}><IoIosArrowForward /></button>
                    <button className={`absolute top-1/20 left-1/2 ${buttonStyle}`} onClick={() => this.move(DIRECTIONS.UP)}><IoIosArrowUp /></button>
                    <button className={`absolute bottom-1/20 left-1/2 ${buttonStyle}`} onClick={() => this.move(DIRECTIONS.DOWN)}><IoIosArrowDown /></button>
                </div>
                <div className={controlButtonContainerStyle}>
                    <button className={zoomButtonStyle} onClick={() => this.zoom(ZOOM_OPTIONS.IN)}><FiPlus /></button>
                    <button className={zoomButtonStyle} onClick={() => this.zoom(ZOOM_OPTIONS.OUT)}><FiMinus /></button>
                </div>
            </div>
        );
    }
}

export default PTZ;