import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repos/userRepo';

export class AuthService {
    private userRepository: UserRepository;

    constructor() {
        this.userRepository = new UserRepository();
    }

    async authenticateUser(username: string, password: string) {
        const user = await this.userRepository.findUser(username);

        if (!user) {
            throw 'Username not found';
        }

        if (await bcrypt.compare(password, user.password)) {
            const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
            return token;
        } else {
            throw 'Incorrect password';
        }
    }

    async registerUser(username: string, password: string) {
        const hashedPassword = await bcrypt.hash(password, 10);
        this.userRepository.registerUser(username, hashedPassword);
    }
}
