import dotenv from "dotenv";
import { Request, Response } from "express";
import cors from "cors";
import express from "express";
import logger from "./middlewares/logger";
import authRouter from "./routes/auth";
import userRouter from "./routes/user";
import postRouter from "./routes/post";
import profileRouter from "./routes/profile";
import groupRouter from "./routes/group";

dotenv.config();

const app = express();
const corsOptions = {
  origin: process.env.CLIENT_URL,
};
const PORT = process.env.PORT;
console.log("CORS Options:", corsOptions); // Add this line to debug

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(logger);

app.get("/", (req: Request, res: Response) => {
  res.send("<h1>api '/', express running</h1>");
});

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/profile", profileRouter);
app.use("/api/post", postRouter);
app.use("/api/group", groupRouter);

const start = (): void => {
  try {
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};
start();
