import amqp from 'amqplib';

let channel: amqp.Channel;

export const connectRabbitMQ = async () => {
    try {
        const connection = await amqp.connect({
            protocol: 'amqp',
            hostname: process.env.RABBITMQ_HOST || 'localhost',
            port: 5672,
            username: process.env.RABBITMQ_USER || 'guest',
            password: process.env.RABBITMQ_PASSWORD || 'guest',
        });

        channel = await connection.createChannel();

        console.log('✅ Connected to RabbitMQ');
    } catch (error) {
        console.error('❌ Error connecting to RabbitMQ:', error);
    }
}

export const publishToQueue = async (queueName: string, message: any) => {
    if (!channel) {
        console.error('❌ RabbitMQ channel is not initialized');
        return;
    }

    await channel.assertQueue(queueName, { durable: true }); //durable ensures messages are not lost if RabbitMQ restarts
    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), { persistent: true }); //persistent ensures messages are saved to disk
    console.log(`✅ Published message to ${queueName}:`, message);

}