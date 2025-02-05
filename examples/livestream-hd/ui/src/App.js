import React from 'react';
import './App.css';
import MQTT from './components/MQTT';
import Stream from './components/Stream';
import {
  Main,
  Gradient,
} from '@kerberos-io/ui';
import { STREAM_MODE_OPTIONS } from './constants/constants';
;
class App extends React.Component {

  // MQTT broker connection details, this is used to communicate
  // Between this application and the Agent.
  mqttURI = window.env.MQTT_URI;
  mqttUsername = window.env.MQTT_USERNAME;
  mqttPassword = window.env.MQTT_PASSWORD;

  // To communicate with the Agents, we need to use the hubPublicKey and hubPrivateKey.
  // The public key is used to target the desired agents within a Hub subscription.
  // The private key is used to encrypt and decrypt the data secu
  hubPublicKey = window.env.HUB_PUBLIC_KEY;
  hubPrivateKey = window.env.HUB_PRIVATE_KEY;

  // List of agents (cameras) to display, we'll use the Agent id
  // to get the stream of the desired cameras.
  agents = [
    'camera2',
    'camera3',
    'camera4',
    'camera5',
    'camera6',
    'camera7',
    'camera8',
    'camera9',
    'camera1',
    'camera1',
    'camera7',
    'camera8',
    'camera9',
    'camera1',
    'camera1',
    'camera1',
    'camera1',
    'camera7',
    'camera8',
    'camera9',
    'camera1',
    'camera1',
    'camera8',
    'camera9',
    'camera1',
    'camera1',
    'camera1',    'camera8',
    'camera9',
    'camera1',
    'camera1',
    'camera1',    'camera8',
    'camera9',
    'camera1',
    'camera1',
    'camera1',    'camera8',
    'camera9',
    'camera1',
    'camera1',
    'camera1',    'camera8',
    'camera9',
    'camera1',
    'camera1',
    'camera1',    'camera8',
    'camera9',
    'camera1',
    'camera1',
    'camera1',    'camera8',
    'camera9',
    'camera1',
    'camera1',
    'camera1',    'camera8',
    'camera9',
    'camera1',
    'camera1',
    'camera1',    'camera8',
    'camera9',
    'camera1',
    'camera1',
    'camera1',    'camera8',
    'camera9',
    'camera1',
    'camera1',
    'camera1',    'camera8',
    'camera9',
    'camera1',


    // ... and more
  ]

  constructor() {
    super();
    this.state = {
      isConnecting: true,
      connected: false,
      error: false,
      globalStreamMode: STREAM_MODE_OPTIONS.WEBRTC,
      pageHeight: window.innerHeight,
      pageWidth: window.innerWidth,
      agentCount: this.agents.length,
      rectangles: [],
    };
  }

  changeGlobalStreamMode = (streamMode) => {
    this.setState({ globalStreamMode: streamMode });
  };

  findBestGrid(n) {
    let bestR = 1, bestC = n;
    let minDiff = Infinity;
    const pageHeight = window.innerHeight;
    const pageWidth = window.innerWidth;
    for (let r = 1; r <= n; r++) {
      if (n % r === 0) {  // R must be a factor of N
        let c = n / r;
        let imgWidth = pageHeight / c;
        let imgHeight = pageWidth / r;
        let diff = Math.abs(imgWidth - imgHeight); // Keep aspect ratio close to square

        if (diff < minDiff) {
          minDiff = diff;
          bestR = r;
          bestC = c;
        }
      }
    }
    return { rows: bestR, cols: bestC };
  }
  
  getOptimalLayout(pageHeight, pageWidth, amount) {
    let best = { width: 0, cols: 1, rows: amount };
    
    for (let cols = 1; cols <= amount; cols++) {
      const rows = Math.ceil(amount / cols);
      const candidateWidth = Math.floor(pageWidth / cols);
      if (candidateWidth < 150) continue;
      const candidateHeight = candidateWidth * 0.75;
      if (rows * candidateHeight <= pageHeight && candidateWidth > best.width) {
        best = { width: candidateWidth, cols, rows };
      }
    }
  
    const height = best.width * 0.75;
    const subRectangles = [];
    let count = 0;
    for (let r = 0; r < best.rows && count < amount; r++) {
      for (let c = 0; c < best.cols && count < amount; c++) {
        subRectangles.push({
          x: c * best.width,
          y: r * height,
          width: best.width,
          height
        });
        count++;
      }
    }
    return subRectangles;
  }

  updateDimensions = () => {

    const agentCount = this.agents.length;
    const rowsAndColumns = this.findBestGrid(agentCount);
    console.log('grdrrdgdr', window.innerHeight, window.innerWidth);
    const rectangles = this.getOptimalLayout(window.innerHeight, window.innerWidth, agentCount);
    console.log(rectangles);
    this.setState({
      pageHeight: window.innerHeight,
      pageWidth: window.innerWidth,
      agentWidth: rowsAndColumns.cols,
      agentHeight: rowsAndColumns.rows,
      rectangles: rectangles,
    });
  };



  componentDidMount(){
    this.mqtt = new MQTT({
      mqttURI: this.mqttURI, 
      mqttUsername: this.mqttUsername, 
      mqttPassword: this.mqttPassword,
      hubPublicKey: this.hubPublicKey, 
      hubPrivateKey: this.hubPrivateKey, 
    });
    
    this.mqtt.connect((connected) => {
      this.setState({
        isConnecting: false,
        connected: connected
      });
    });

    // Get initial dimensions
    this.updateDimensions();

    // Add event listener for window resize
    window.addEventListener('resize', this.updateDimensions);
  }

  render() {

    const baseStyle = "flex justify-center items-centerd p-3 h-full";
    const selectedStyle = `${baseStyle} bg-gray-800 text-white`;
    let { globalStreamMode, agentWidth, agentHeight, rectangles } = this.state;
    console.log(agentWidth, agentHeight);

    return (<div className='w-full h-full relative'>
      { rectangles.map((rectangle, index) => {
        return <div key={index} style={{
          position: 'absolute',
          top: rectangle.y,
          left: rectangle.x,
          width: rectangle.width,
          height: rectangle.height,
          border: '1px solid black',
        }}>
        </div>
      })}
    </div>)
  }
}

export default App;
