import { Request, Response } from "express";
import cors from "cors";
import express from "express";
import logger from "./middlewares/logger";
import authRouter from "./routes/auth";
import userRouter from "./routes/user";
import postRouter from "./routes/post";
import profileRouter from "./routes/profile";
import groupRouter from "./routes/group";

const app = express();
const corsOptions = {
  origin: "http://localhost:3000",
};
const PORT = process.env.PORT;
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
