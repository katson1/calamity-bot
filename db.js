import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGODB_CONNECT;

const startSever = () => {
    mongoose.connect(uri);

    const db = mongoose.connection;
    
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function() {
        console.log("Successfully connected to the database");
    });
}

export default startSever;
