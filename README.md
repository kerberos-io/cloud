# Hub

Hub is the single pane of glass for your Agents. It comes with a best-of-breed open-source technology stack, a modular and scale-first mindset, and allows you to build and maintain an ever-growing video surveillance and video analytics landscape. With Hub, you can seamlessly integrate various components, ensuring a robust and scalable solution for all your video monitoring needs. Whether you are managing a few cameras or a large-scale deployment, Hub provides the tools and flexibility to adapt and grow with your requirements.

![hub-dashboard](assets/images/hub-dashboard.gif)

Hub offers an extensive set of features that enable you to scale and manage a comprehensive video surveillance landscape:

- Organize cameras with groups and sites for better governance.
- High-definition on-demand livestreaming.
- Daily recording overviews.
- Real-time notifications with configurable alerts.
- Advanced video analytics using machine learning models.
- And many more features.

## :books: Overview

### Introduction

1. [License](#license)
2. [Building blocks and components](#building-blocks-and-components)
3. [Architecture](#architecture)

### Installation

4. [Prerequisites](#prerequisites)
   - [Add helm repos](#add-helm-repos)
   - [Cert manager](#cert-manager)
   - [Message broker / queue](#message-broker-or-queue)
   - [Event broker](#event-broker)
   - [Database](#database)
   - [TURN/STUN](#turnstun)
   - [Ingress](#ingress)
5. [Kerberos Hub](#kerberos-hub)
   - [Kerberos Hub Object Detector](#kerberos-hub-object-detector)

## License

> To request a license you can reach out to `support@kerberos.io`.

To start using Hub, you'll require a license. This license will grant access to the Hub and allow you to connect a specific number of Agents and Vaults. Hub can be installed without a license key, allowing you to verify the installation before entering into a license agreement. This ensures you are confident in your deployment.

The license key ensures business continuity in the event of license expiration. Once the license expires, the system will continue to work (no data loss); however, you will be prompted on the login page that your license has expired, and you will no longer be able to sign in.

A license key specifies the number of Agents and cameras you can connect to the Hub, as well as the duration of the license period. If the number of Agents exceeds the licensed amount, Hub will continue to operate, but you will receive a notification prompting you to upgrade your license.

[A free license](https://github.com/kerberos-io/helm-charts/blob/main/charts/hub/values.yaml#L10-L11) is included with the existing deployment, allowing you to connect up to 8 Agents to Hub. If you need to connect more than 8 Agents, please contact us to request an extended license.

## Building blocks and components

Hub is composed of and relies on several open-source components to ensure scalability and high availability. The key components include:

- **MongoDB**: storage of meta data about Agents, recordings, notifications and more.
- **MQTT broker**: Facilitates bi-directional communication between Agents and Hub.
- **AMQP broker**: Handles asynchronous event processing within the Hub.
- **TURN/STUN server**: High definition (WebRTC) livestreaming

Above components are a prerequisite for a complete Hub installation. If one of the above components is missing, for example, a TURN/STUN server, it will mean that the live streaming feature will not be working.

Once all components are in place you can complete the installation by configuring and installing the Hub through our [helm chart](https://github.com/kerberos-io/helm-charts/tree/main/charts/hub) into your Kubernetes cluster.

## Architecture

As shown below you will find the architecture of what we are going to install (the green rectangle).

![hub-architecture](assets/images/hub-deployment.png)

# Prerequisites

## Add helm repos

The Kerberos Hub installation makes use a couple of other charts which are shipped within their on Helm repos. Therefore, we will add those repos to our Kubernetes cluster.

    helm repo add bitnami https://charts.bitnami.com/bitnami
    helm repo add jetstack https://charts.jetstack.io
    helm repo add vernemq https://vernemq.github.io/docker-vernemq
    helm repo add kerberos https://charts.kerberos.io
    helm repo update

## Cert manager

We rely on cert-manager and letsencrypt for generating all the certificates we'll need for the Kerberos Hub web interface, Kerberos Hub api and the Vernemq broker (WSS/TLS).

As a best practice we will install all the dependencies in their own namespace. Let's start by creating a separate namespace for cert-manager.

    kubectl create namespace cert-manager

Install the cert-manager helm chart into that namespace.

    helm install cert-manager jetstack/cert-manager --namespace cert-manager --set installCRDs=true

If you already have the CRDs install you could get rid of `--set installCRDs=true`.

Next we will install a cluster issuer that will make the HTTP01 challenges, this is needed for resolving the certificates of both Kerberos Hub web interface and api.

    kubectl apply -f cert-manager/cluster-issuer.yaml

## Message broker or queue

To integrate, scale and make Kerberos Hub more resilient the Kerberos Hub pipeline is using a message broker (or queue) to provide a resilient message flow. The message broker integrates the different micro services you'll find in Kerberos Hub, and allow you to scale specific services independently. As of now we suppor two main messages brokers: RabbitMQ and Kafka. Depending on your current solution landscape and/or skills you might prefer one over the other.

### RabbitMQ (preferred)

RabbitMQ is the preferred message broker, as it's easy to setup, scale and comes with high availability out of the box. RabbitMQ will distribute messages to the different consumer (microservices). Instead of self-hosting a RabbitMQ (as shown below), you might also use a RabbitMQ hosted on a cloud provider like (AWS, GCP, Azure, etc). We support both AMQP and AMQPS.

As a best practice let's create another namespace.

    kubectl create namespace rabbitmq

Before installing [the RabbitMQ helm chart,](https://github.com/bitnami/charts/tree/main/bitnami/rabbitmq) make sure to have a look at the `rabbitmq/values.yaml` file. This includes different variables such as `username`, `password`, `replicaCount` and more. Change those settings for your own preference or usecase.

    helm install rabbitmq bitnami/rabbitmq -n rabbitmq -f rabbitmq/values.yaml --version 11.12.0

You might need to add a few CRD's. If you see following error, `unable to recognize "": no matches for kind "ServiceMonitor" in version "monitoring.coreos.com/v1`.

    kubectl create -f https://raw.githubusercontent.com/prometheus-operator/prometheus-operator/master/bundle.yaml

### or Kafka

Kafka is used for the Kerberos Pipeline, this is the place where microservices are executed in parallel and/or sequentially. These microservices will receive events from a Kafka topic and then process the recording, and it's metadata. Results are injected back into Kafka and passed on to the following microservices. Microservices are independently horizontal scalable through replicas, this means that you can distribute your workload across your nodes if a specific microservice requires that.

As a best practice let's create another namespace.

    kubectl create namespace kafka

Before installing the Kafka helm chart, go and have a look in the kafka/values.yaml file. You should update the clientUsers and clientPasswords. Have a look at the zookeeper credentials as well and update accordingly. Make sure to install version 18.4.4, as this `values.yaml` is matched for that specific helm release.

    helm install kafka bitnami/kafka -f ./kafka/values.yaml -n kafka  --version 20.0.2

## Event broker

Next to a message broker, we are using an event broker (MQTT) for bidirectional communication in the Kerberos Hub ecosystem. As shown below we recommended vernemq in a self-hosted scenario as it provides horizantal scale, however nothing is stopping you to install a `Mosquitto` MQTT broker on a seperate VM if you prefer, or use a managed MQTT broker on a cloud provider like AWS, GCP, Azure, etc.

### Vernemq

This Vernemq broker, which is horizontal scalable, allows communicating with Kerberos agents at the edge (or wherever they live) and Kerberos Vault to forward recordings from the edge into the cloud.

We'll create a namespace for our event broker Vernemq.

    kubectl create namespace vernemq

Create a certificate, so we can handle TLS/WSS. (this needs a DNS challenge)

    kubectl apply -f vernemq/vernemq-secret.yaml --namespace cert-manager
    kubectl apply -f vernemq/vernemq-issuer.yaml --namespace vernemq
    kubectl apply -f vernemq/vernemq-certificate.yaml --namespace vernemq

By default, a username and password is set for the Vernemq broker. You can find these in the `vernemq/values.yaml` file [as shown below](https://github.com/kerberos-io/hub/blob/master/vernemq/values.yaml#L216-L217).

    ...
    - name: DOCKER_VERNEMQ_USER_YOURUSERNAME
    value: "yourpassword"
    ...

Please note that the username is defined in capitals `YOURUSERNAME`, but will result as `yourusername`. So anything written in capitals, will be lowercase.

Go a head and install the Vernemq chart with the relevant configuration options.

    helm install vernemq vernemq/vernemq -f vernemq/values.yaml  --namespace vernemq

## Database

Within Kerberos Hub data is stored/required for users, recordings, sites, groups and many other entities. As for now the entire Kerberos.io technology stack is relying on MongoDB.

### MongoDB

A MongoDB instance is used for data persistence. Data might come from the Kerberos Pipeline or user interaction on the Kerberos Hub frontend. You can consider to use managed MongoDB (through [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) or a cloud provider like AWS, GCP or azure) or you can use the self-hosted deployment as mentioned below.

For the self-hosted deployment we will be using [the official bitnami mongodb helm chart](https://github.com/bitnami/charts/tree/main/bitnami/mongodb). Please navigate to there [repository](https://github.com/bitnami/charts/tree/main/bitnami/mongodb) for more configuration options.

We will create a namespace for our MongoDB deployment as well.

    kubectl create namespace mongodb

Create a persistent volume, this is where the data will be stored on disk.

    kubectl apply -f ./mongodb/fast.yaml

Before installing the MongoDB helm chart, go and have a look in the `mongodb/values.yaml` file. You should update the root password to a custom secure value.

    helm install mongodb bitnami/mongodb --values ./mongodb/values.yaml -n mongodb

## TURN/STUN

Within Kerberos Hub we allow streaming live from the edge to the cloud without port-forwarding. To make this work we are using a technology called WebRTC that leverages a TURN/STUN server.

![hub-architecture](assets/images/hub-stunturn.png)

To run a TURN/STUN we recommend installing coturn on a dedicated/stand-alone machine. The TURN/STUN server will make sure a connection from a Agent to a Hub viewer is established. More information on how to install coturn and configure it on a Ubuntu machine can be [found here](https://www.linuxbabe.com/linux-server/install-coturn-turn-server-spreed-webrtc).

    sudo apt install coturn
    systemctl status coturn
    sudo systemctl start coturn

Make the appropriate changes in the `turnserver.conf`, for example the DNS name and user credentials.

    sudo nano /etc/turnserver.conf

## Ingress

Ingresses are needed to expose the Kerberos Hub front-end and api to the internet or intranet. We prefer nginx ingress but if you would prefer Traefik, that is perfectly fine as well.

### Nginx

We'll use following helm chart `ingress-nginx` for setting up nginx in our cluster.

    helm upgrade --install ingress-nginx ingress-nginx \
    --repo https://kubernetes.github.io/ingress-nginx \
    --namespace ingress-nginx --create-namespace

On AKS add following attribute, otherwise nginx will not be accessible through `LoadBalancer`. You will receive an not reachable error.

    --set controller.service.externalTrafficPolicy=Local

# Hub

So once you hit this step, you should have installed all previous defined dependencies. Go to [the Hub helm chart repo](https://github.com/kerberos-io/helm-charts/blob/main/charts/hub), there you'll find all the relevant information for configuring and creating an instance of Hub.

If you already know what to do, grab the latest `values.yaml` at the [Hub Helm chart repo](https://github.com/kerberos-io/helm-charts/blob/main/charts/hub/values.yaml), and reference it from your `helm install` or `helm upgrade` command.

Install the Hub chart in a specific namespace and take into the values.yaml file.

    helm install hub kerberos/hub --values values.yaml -n kerberos-hub --create-namespace

Upgrade the Hub chart

    helm upgrade hub kerberos/hub --values values.yaml -n kerberos-hub

Uninstall the Hub chart

    helm uninstall hub -n kerberos-hub
