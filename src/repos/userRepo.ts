import { User } from '../models/userModel';

export class UserRepository {
    async findUser(username: string) {
        return await User.findOne({ username });
    }

    async registerUser(username: string, hashedPassword: string) {
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();
    }
}
