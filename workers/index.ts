require('dotenv').config()
import mongoose, { CallbackError } from 'mongoose';
import { MongoError } from 'mongodb';
import rollingBuffer, { bufferListener, archiveListener } from './runningBuffer';
import handleAlarms, { alarmListener } from './alarmHandlers';
import deviceNetworkStart, { deviceNetworkListener } from './deviceNetwork';
import mqttConnect from '../server/lib/mqttConnect';
import { GraphQLClient } from 'graphql-request';


const runWorkers = async () => {
    await mongoose.connect(`${process.env.MONGODB_URI}`,
        {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
        },
        (err: CallbackError) => {
            if (err) {
                console.error(`🤖🟥🗃️ Worker failed to connect to the database.`);
                console.error(err);
                console.log(process.env.MONGODB_URI);
            } else {
                console.log(`🤖📡🗃️ Worker connected to the database`);
            }
        }
    );

    const mqttClient = mqttConnect(`🤖`, "Worker");

    const PORT = process.env.PORT || "3000";

    const gqlClient: GraphQLClient = new GraphQLClient(`http://localhost:${PORT}/graphql`, {
        credentials: "include",
        mode: "cors"
    });

    mqttClient.on("message", (msgTopic, message) => {
        bufferListener(msgTopic, message);
        archiveListener(msgTopic, message);
        alarmListener(gqlClient, msgTopic, message);
        deviceNetworkListener(gqlClient, msgTopic, message);
    });
    rollingBuffer(mqttClient);
    handleAlarms(mqttClient);
    deviceNetworkStart(mqttClient);
}

runWorkers();