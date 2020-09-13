import mongoose from 'mongoose';
import { MongoError } from 'mongodb';
import rollingBuffer, { bufferListner } from './runningBuffer';
import handleAlarms, { alarmListner } from './alarmHandlers';
import topicNetworkStart, { topicNetworkListner } from './topicNetwork';
import mqttConnect from '../server/lib/mqttConnect';
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config({ path: '.env.local' })
}
const runWorkers = async () => {
    await mongoose.connect(`${process.env.MONGODB_PROTO}${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_DOMAIN}`,
        {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
        },
        (err: MongoError) => {
            if (err) {
                console.error(`🤖🟥🗃️ Worker failed to connect to the database.`);
                console.error(err);
            } else {
                console.log(`🤖📡🗃️ Worker connected to the database at ${process.env.MONGODB_PROTO}${process.env.MONGODB_DOMAIN}`);
            }
        }
    );

    const client = mqttConnect(`🤖`, "Worker");

    client.on("message", (msgTopic, message) => {
        bufferListner(msgTopic, message);
        alarmListner(msgTopic, message);
        topicNetworkListner(msgTopic, message);
    });
    rollingBuffer(client);
    handleAlarms(client);
    topicNetworkStart(client);
}

runWorkers();