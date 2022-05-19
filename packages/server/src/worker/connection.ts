const split = (process.env.REDIS_CONN || 'redis:6381').split(':');
export const HOST = split[0];
export const PORT = Number(split[1]);