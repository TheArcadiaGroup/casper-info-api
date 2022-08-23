import mongoose from 'mongoose';

export const connectDB = async (): Promise<mongoose.Connection> => {
  return await mongoose
    .connect(
      'mongodb+srv://casper-trench:sXihiV4rEKbTRDjJ@caspertrench.3zk1dmc.mongodb.net/casper-trench?retryWrites=true&w=majority'
    )
    .then((conn) => {
      return conn.connection;
    })
    .catch((err) => {
      console.log(err);
      process.exit(1);
    });
};
