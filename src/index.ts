import express, {Application, Request, Response} from "express";
import dotenv from "dotenv";
import path from 'path';
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import { isAuthenticated } from './middlewares/authMiddleware'; // Adjust path to your middleware
import jwt, { JwtPayload } from "jsonwebtoken";
import authRoutes from './routes/authRoutes';
import { User } from './models/userModel';

dotenv.config();

const app:Application= express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('./views', path.join(__dirname, 'views'));

app.use(cors());
app.use(cookieParser());

app.get('/', isAuthenticated, async (req, res) => {
  // console.log(req.cookies.token);

  let userid = jwt.verify(req.cookies.token, process.env.JWT_SECRET as string) as JwtPayload;

  // const user = await User.find({ 'userId': userid.userId });
  const user = await User.findOne({'_id':userid.userId});

  res.render('index',{
    'username':user!.username
  }
  );  // Render the homepage or dashboard
});


app.use(express.static('public')); // If you have static files
app.use(express.urlencoded({ extended: true })); // For form parsing
app.use(express.json()); // For parsing JSON bodies
app.use('/auth', authRoutes);



app.listen(port, async () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);

  // Connect To The Database
  try {
    await mongoose.connect(
      process.env.DATABASE_URL as string
    );
    console.log("🛢️  Connected To Database");
  } catch (error) {
    console.log("⚠️ Error to connect Database");
  }
});