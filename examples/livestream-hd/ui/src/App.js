import React from 'react';
import './App.css';
import MQTT from './components/MQTT';
import Stream from './components/Stream';
import {
  Main,
  Gradient,
} from '@kerberos-io/ui';
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
    'camera1',
    'camera2',
    'camera3',
    'camera4',
    'camera5',
    'camera6',
    'camera7',
    'camera8',
    'camera9',
    // ... and more
  ]

  streamModeOptions = ["jpeg", "webrtc"];


  constructor() {
    super();
    this.state = {
      isConnecting: true,
      connected: false,
      error: false,
      globalStreamMode: this.streamModeOptions[1],
    };
  }

  toggleStreams = () => {
    this.setState(prevState => {
        const currentIndex = this.streamModeOptions.indexOf(prevState.globalStreamMode);
        const nextIndex = (currentIndex + 1) % this.streamModeOptions.length;
        return { globalStreamMode: this.streamModeOptions[nextIndex] };
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
  }

  render() {

    const baseStyle = "px-2 py-1 overflow-hidden";
    const selectedStyle = `${baseStyle} bg-gray-800 text-white`;
    const { globalStreamMode } = this.state;

    return <div id="page-root">
    <Main>
      <Gradient />
      <div className='flex justify-between items-center'>
        {this.state.isConnecting && <div className='bg-orange-500 text-orange-50 p-2 w-fit'>Connecting to MQTT.</div>}
        {this.state.error && <div className='bg-red-500 text-red-50 p-2 w-fit'>Error connecting to MQTT.</div>}
        {this.state.connected && <div className='bg-green-500 text-green-50 p-2 w-fit'>Connected to MQTT!</div>}

        <div className='flex justify-center items-center gap-2'>
          <div className="flex items-center gap-2 shadow-md px-2 py-2">
            <span>All</span>
            <button className="text-gray-800 bg-gray-400 bg-opacity-70 rounded-full flex items-center overflow-hidden justify-center text-xs z-50"
                onClick={this.toggleStreams}>
                <span className={(globalStreamMode === this.streamModeOptions[0]) ? selectedStyle : baseStyle}>SD</span>
                <span className={(globalStreamMode === this.streamModeOptions[1]) ? selectedStyle : baseStyle}>HD</span>
            </button>
          </div>
        </div>
      </div>

      {/* Wait for MQTT connection before rendering streams */}
      <div className="grid justify-items-stretch grid-cols-3 gap-0 bg-white pb-4">
      { this.state.connected && this.agents.map((agent) => {
        return <div className="relative w-full flex items-center justify-center bg-black text-white" key={agent}>
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
