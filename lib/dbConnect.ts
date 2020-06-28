import mongoose from 'mongoose';

const connection = { isConnected: false };


const dbConnect = async () => {
    if (connection.isConnected) return;

    if (!process.env.MONGODB_URI) throw new Error(`No Mongo URI loaded.`);
    console.log("Connecting to mongoDB.");
    const db = await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
    });
    connection.isConnected = !!db.connections[0].readyState;
}

export default dbConnect;