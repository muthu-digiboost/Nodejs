import {createClient} from "@redis/client";

export const redisClient = createClient({
    url: 'redis://localhost:6379'
});

if (1 === 0) {
    redisClient.on('error', (err) => console.error('Redis error:', err));
    await redisClient.connect();
}

