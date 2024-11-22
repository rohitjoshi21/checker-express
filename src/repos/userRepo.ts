import { User } from '../models/userModel';

export class UserRepository {
    async findUser(username: string) {
        return await User.findOne({ username: username });
    }

    async findUserById(userid: string) {
        return await User.findById(userid);
    }

    async registerUser(username: string, hashedPassword: string) {
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();
    }
}
