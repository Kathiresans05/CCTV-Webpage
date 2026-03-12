import mongoose from 'mongoose';

const uri = "mongodb+srv://kathiresansengodan_db_user:rCOg41duExawFe4X@cluster0.nvczc0v.mongodb.net/CCTV";

async function test() {
    try {
        console.log("Connecting...");
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
        console.log("Connected successfully!");
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log("Collections:", collections.map(c => c.name));
        process.exit(0);
    } catch (err) {
        console.error("Connection failed:", err.message);
        process.exit(1);
    }
}

test();
