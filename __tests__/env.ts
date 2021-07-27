import dotenv from "dotenv";

it('Environment variables properly defined', () => {
    dotenv.config()
    expect(process.env.MONGODB_URI).toBeDefined();
    expect(process.env.TOKEN_SECRET).toBeDefined();
    expect(process.env.MQTT_URI).toBeDefined();
    expect(process.env.MQTT_USERNAME).toBeDefined();
    expect(process.env.MQTT_PASSWORD).toBeDefined();
})