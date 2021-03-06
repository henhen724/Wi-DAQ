import "reflect-metadata";
import { ObjectType, ArgsType, Arg, Resolver, Query, Mutation, Subscription, Field, ID, Int, Ctx, Args, PubSub, Publisher, PubSubEngine, Root } from "type-graphql";
import { GraphQLTimestamp } from "graphql-scalars";

import NotificationModel, { Notification as NotificationDoc } from "../../models/Notification";
import SuccessBoolean from "../types/SuccessBoolean";
import { UserInputError } from 'apollo-server';

@ObjectType()
class Notification {
    @Field(type => ID)
    _id: string;
    @Field()
    name: string;
    @Field()
    topic: string;
    @Field()
    message: string;
    @Field()
    mqttMessage: string;
    @Field(type => GraphQLTimestamp)
    received: Date;
    @Field()
    viewed: boolean;
}

@ArgsType()
class CreateNotificationInput {
    @Field()
    name: string;
    @Field()
    topic: string;
    @Field()
    message: string;
    @Field()
    mqttMessage: string;
}

@Resolver()
class NotificationResolver {
    @Query(returns => [Notification])
    async notifications() {
        return (await NotificationModel.find({}).sort({ "received": "desc" }).exec());
    }
    @Query(returns => Notification)
    async notificationById(@Arg("id") id: string) {
        return await NotificationModel.findById(id).exec();
    }


    @Mutation(returns => SuccessBoolean)
    async viewNotification(@Arg("id") id: string) {
        const notification = await NotificationModel.findById(id);
        if (notification) {
            notification.viewed = true;
            await notification.save();
            return { success: true };
        } else {
            return { success: false, message: "No such notification." }
        }
    }
    @Mutation(returns => Notification)
    async createNotification(@Args() input: CreateNotificationInput, @PubSub("CREATE") publish: Publisher<Notification>) {
        return await new Promise(res => NotificationModel.create(input, (err: any, noto: any) => {
            if (err) throw new UserInputError(err);
            publish(noto.toObject());
            res(noto);
        }));

    }
    @Mutation(returns => SuccessBoolean)
    async deleteNotification(@Arg("id") id: string, @PubSub("DELETE") publish: Publisher<string>) {
        await publish(id);
        await NotificationModel.findByIdAndDelete(id);
        return { success: true };
    }


    @Subscription(returns => Notification, { topics: "CREATE" })
    watchCreatedNotifications(@Root() noto: Notification): Notification {
        return noto;
    }
    @Subscription(returns => String, { topics: "DELETE" })
    watchDeletedNotifications(@Root() id: string): string {
        return id;
    }
}

export default NotificationResolver;