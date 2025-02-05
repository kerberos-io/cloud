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
    return <div id="page-root" class="flex-1 flex flex-col h-full">
    <Main className="flex-1 flex flex-col h-full">
      {/* Wait for MQTT connection before rendering streams */}
      <div className={`grid gap-0 bg-white pb-4 h-full overflow-hidden`} style={{ 
        gridTemplateColumns: `repeat(auto-fill, minmax(${agentHeight}px, 1fr))` ,
        gridTemplateRows: `repeat(auto-fill, minmax(${agentWidth}px, 1fr))` ,
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
