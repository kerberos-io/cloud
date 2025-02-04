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

  updateDimensions = () => {

    const agentCount = this.agents.length;
    const rowsAndColumns = this.findBestGrid(agentCount);
    this.setState({
      pageHeight: window.innerHeight,
      pageWidth: window.innerWidth,
      agentWidth: rowsAndColumns.cols,
      agentHeight: rowsAndColumns.rows,
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
    let { globalStreamMode, agentWidth, agentHeight } = this.state;
    return <div id="page-root" class="flex-1 flex flex-col h-full">
    <Main className="flex-1 flex flex-col h-full">
      <Gradient />
      <div className='flex justify-between items-center h-10 bg-black'>
        {this.state.isConnecting && <div className='bg-orange-500 text-orange-50 p-2 w-fit'>Connecting to MQTT.</div>}
        {this.state.error && <div className='bg-red-500 text-red-50 p-2 w-fit'>Error connecting to MQTT.</div>}
        {this.state.connected && <div className='bg-green-500 text-green-50 p-2 w-fit'>Connected to MQTT!</div>}

        <div className='flex justify-center items-center gap-2 h-full'>
          <div className="flex items-center gap-2 text-white h-full shadow-md">
            <span>All</span>
            <div className="text-gray-800 bg-gray-400 bg-opacity-70 flex items-center overflow-hidden justify-center h-full text-xs z-50">
                <button className={(globalStreamMode === STREAM_MODE_OPTIONS.JPEG) ? selectedStyle : baseStyle} onClick={() => this.changeGlobalStreamMode(STREAM_MODE_OPTIONS.JPEG)}>SD</button>
                <button className={(globalStreamMode === STREAM_MODE_OPTIONS.WEBRTC) ? selectedStyle : baseStyle} onClick={() => this.changeGlobalStreamMode(STREAM_MODE_OPTIONS.WEBRTC)}>HD</button>
            </div>
          </div>
        </div>
      </div>

      {/* Wait for MQTT connection before rendering streams */}
      <div className={`grid gap-0 bg-white pb-4 h-screen`} style={{ 
        height: "100vh",
        gridArea: "1 / 1 / 2 / 2",
        }}>
      { this.state.connected && this.agents.map((agent, index) => {
        return <div className="relative group flex items-center justify-center bg-black text-white" key={agent + index}>
                  <Stream name={agent} 
                          mqtt={this.mqtt}
                          globalStreamMode={globalStreamMode}/>
                  <div className="absolute top-0 left-0 bg-black text-white p-2">{agent}</div>
                </div>
      })}
      </div>
    </Main>
  </div>;
  }
}

export default App;
