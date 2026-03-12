import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const stockSchema = mongoose.Schema({
    productId: String,
    productName: String,
    productImage: String,
    productImages: [String]
});

const Stock = mongoose.model('Stock', stockSchema);

const updateGallery = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB Atlas');

        const products = await Stock.find({});
        console.log(`Found ${products.length} products`);

        // Update a few products with multiple images for demonstration
        // We'll reuse some existing Cloudinary URLs or common patterns
        for (let i = 0; i < products.length; i++) {
            const p = products[i];
            
            // For demo, we'll just duplicate the main image 3 times or use some variations if possible
            // In a real scenario, these would be different angles
            const gallery = [
                p.productImage,
                p.productImage, // Variation 1 (placeholder)
                p.productImage, // Variation 2 (placeholder)
                p.productImage  // Variation 3 (placeholder)
            ];

            await Stock.findByIdAndUpdate(p._id, { productImages: gallery });
            console.log(`Updated gallery for: ${p.productName}`);
        }

        console.log('Successfully updated gallery images for all products.');
        process.exit();
    } catch (error) {
        console.error('Update Error:', error);
        process.exit(1);
    }
};

updateGallery();
