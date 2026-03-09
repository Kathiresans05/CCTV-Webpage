import jwt from 'jsonwebtoken';

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'securevision_secret_key', {
        expiresIn: '30d'
    });
};

export default generateToken;
