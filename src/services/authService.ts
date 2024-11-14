import bcrypt from 'bcrypt';
import { User } from '../models/userModel'; // Import your User model

export const authService = {
    async authenticateUser(username: string, password: string) {
        const user = await User.findOne({ username });
        if (user && await bcrypt.compare(password, user.password)) {
            return user;
        }
        return null;
    },
    
    async registerUser(username: string, hashedPassword: string) {
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();
    }
};
