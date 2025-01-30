import React from 'react';

class JPEG extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            liveview: ""
        };
    }

    componentDidMount() {
        const { mqtt, name } = this.props;
        this.mqtt = mqtt;
        this.name = name;

        // To start receiving messages, we need to send heartbeats to the topic: kerberos/agent/{hubKey}
        // This will wakeup the desired agents, and they will start sending JPEGS to the kerberos/hub/{hubKey} topic.
        setInterval(() => {
           this.publish();
        }, 3000);

        // We need to subscribe to the specific camera to receive the liveview.
        // After the request-sd-stream action is sent, the agent will start sending 
        // JPEGS to the kerberos/hub/{hubKey} topic.
        this.subscribe();
    }

    subscribe() {
        // We're listening for the "receive-sd-stream" action for the specific
        // camera (all other actions are ignored).
        // Each time we receive a message with this action, we update the liveview state.
        this.mqtt.on(this.name, (_, message) => {
            const { payload } = message;
            if (payload.action === "receive-sd-stream") {
                const { value } = payload;
                this.setState({
                    liveview: value.image
                });
            }
        });
    }

    publish() {
        const payload = {
            action: "request-sd-stream",
            device_id: this.name,
            value: {
                timestamp: Math.floor(Date.now() / 1000),
            }
        };
        this.mqtt.publish(payload);
    }

    render() {
        const { liveview } = this.state;
        return (
            <div>
             { liveview !== "" && <img src={`data:image/png;base64, ${liveview}`} alt="Liveview" />  }
             { liveview === "" && <p>No liveview available</p> }
             </div>
        );
    }
}

export default JPEG;