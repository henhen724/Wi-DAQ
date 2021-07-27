require('dotenv').config()

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');


// Use connect method to connect to the Server
MongoClient.connect(process.env.MONGODB_URI, { useUnifiedTopology: true }, async function (err, client) {
    if (err) {
        console.log("Failed to connect: ", err);
    } else {
        // console.log(await client.db().admin().listDatabases())
        const db = await client.db("controlflow");
        const archive = await db.collection("data_archive");
        const result = await archive.deleteMany({ topic: "sergeispizero/teensy/TC0" });

        if (result.deleteCount >= 1) {
            console.log(`Successfully deleted ${result.deleteCount} packets`);
        } else {
            console.log("Failed to delete any packets: ", result);
        }
    }


    client.close();
});