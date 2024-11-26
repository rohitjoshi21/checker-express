import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repos/userRepo';
import { CustomError } from '../types/CustomError';

export class AuthService {
    private userRepository: UserRepository;

    constructor() {
        this.userRepository = new UserRepository();
    }

    async authenticateUser(username: string, password: string) {
        const user = await this.userRepository.findUser(username);

        if (!user) {
            throw new CustomError(`Username "${username}" not found`, 400, 'LoginError');
        }

        if (await bcrypt.compare(password, user.password)) {
            const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
            return token;
        } else {
            throw new CustomError('Incorrect password', 400, 'LoginError');
        }
    }

    async registerUser(username: string, email: string, password: string) {
        const hashedPassword = await bcrypt.hash(password, 10);
        this.userRepository.registerUser(username, email, hashedPassword);
    }
}
