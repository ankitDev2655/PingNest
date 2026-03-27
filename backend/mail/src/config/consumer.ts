import amqp from 'amqplib';
import nodemailer from 'nodemailer';

import "./env.js";

export const startSendOtpConsumer = async () => {
    try {
        const connection = await amqp.connect({
            protocol: 'amqp',
            hostname: process.env.RABBITMQ_HOST || 'localhost',
            port: 5672,
            username: process.env.RABBITMQ_USER || 'guest',
            password: process.env.RABBITMQ_PASSWORD || 'guest',
        });

        const channel = await connection.createChannel();
        const queueName = 'send_otp_queue';
        await channel.assertQueue(queueName, { durable: true });

        console.log(`✅ Waiting for messages in ${queueName}..., Listening for OTP email requests`);

        channel.consume(queueName, async (msg) => {
            if(msg){
                try {
                    const {to, subject, body}= JSON.parse(msg.content.toString());

                    // Create a transporter using your email service configuration
                    const transporter = nodemailer.createTransport({
                        host: 'smtp.gmail.com', // Replace with your SMTP server
                        port: 465,
                        auth: {
                            user: process.env.EMAIL_USER, // Replace with your email address
                            pass: process.env.EMAIL_PASSWORD, // Replace with your email password
                        },
                    });

                    await transporter.sendMail({
                        from: 'PingNest - Chat App <' + process.env.EMAIL_USER + '>',
                        to,
                        subject,
                        text: body,
                    });

                    console.log(`✅ Sent OTP email to ${to}`);

                    channel.ack(msg); // Acknowledge the message after successful processing

                } catch (error) {
                    console.error("❌ Error sending OTP email:", error);
                    channel.nack(msg, false); // Reject the message without requeuing
                }
            }
        })

    } catch (error) {
        console.error("❌ Error in startSendOtpConsumer:", error);
    }
}