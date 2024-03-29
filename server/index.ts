import express from 'express';
import mongoose, { CallbackError } from 'mongoose';
import AWS from 'aws-sdk';
AWS.config.update({ region: 'us-east-2' })

import { MongoError } from 'mongodb';
import { createServer } from 'http';
import next from 'next';
import { ApolloServer } from 'apollo-server-express';
const nextApp = next({ dev: process.env.NODE_ENV !== 'production' }); //This loads all of the environment variables
const nextHandler = nextApp.getRequestHandler();

import makeSchema from './apollo/schema';
import { getSession } from './lib/auth';

// Making all models into apollo data sources

//TODO: Add a MQTT state request bundle. (Ask every mqtt client with an on change type packet to post its current state.)

const PORT = process.env.PORT || "3000";


const startServer = async () => {
    await nextApp.prepare();
    await mongoose.connect(`${process.env.MONGODB_URI}`,
        {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
        },
        (err: CallbackError) => {
            if (err) {
                console.error(err);
            } else {
                console.log(`🗃️ Connected to the mongoDB database.`);
            }
        }
    );

    const expressApp = express();
    const schema = await makeSchema();
    const s3 = new AWS.S3({ apiVersion: '2006-03-01' });
    const apollo = new ApolloServer({
        schema,
        context: (ctx) => {
            return {
                session: getSession(ctx.req, ctx.res),
                req: ctx.req,
                res: ctx.res,
                s3
            }
        },
        introspection: true,
        playground: {
            settings: {
                "request.credentials": "include"
            }
        }
    });
    apollo.applyMiddleware({ app: expressApp, path: '/graphql' });
    expressApp.use(express.static('public'));
    expressApp.all('*', (req, res) => nextHandler(req, res));

    const httpServer = createServer(expressApp);
    apollo.installSubscriptionHandlers(httpServer);

    httpServer.listen({ port: PORT }, () => {
        console.log(`👨‍🚀 Wi-DAQ website ready at http://localhost:${PORT}`);
        console.log(`🛸 GraphQL API ready at http://localhost:${PORT}${apollo.graphqlPath}`);
        console.log(`👽 Subscriptions ready at ws://localhost:${PORT}${apollo.subscriptionsPath}`);
    })
}

startServer();