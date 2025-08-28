import {createClient} from "@redis/client";

let redisClient;

if (process.env.NODE_ENV === "prod") {
    redisClient = createClient({
        socket: {
            host: process.env.REDIS_HOST,
            port: process.env.REDIS_PORT
        },
        username: process.env.REDIS_USERNAME || undefined,
        password: process.env.REDIS_PASSWORD || undefined
    });

    redisClient.on("error", (err) => {
        console.error("Redis Client Error", err);
    });

    (async () => {
        try {
            await redisClient.connect();
            console.log("Redis connected");
        } catch (err) {
            console.error("Redis connection failed", err);
        }
    })();
} else {
    const fnEmpty = () => {};
    redisClient = {
        sAdd: fnEmpty,
        sIsMember: fnEmpty,
        expire: fnEmpty,
        sRem: fnEmpty,
        disconnect: fnEmpty
    };
    console.log("Redis disabled in dev");
}

export default redisClient;
