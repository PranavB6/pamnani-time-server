import cors from "cors";
import express, { type Express, type Request, type Response } from "express";
import morgan from "morgan";
import redoc from "redoc-express";
import swaggerUI from "swagger-ui-express";

import errorController from "./middlewares/error";
import openApiSpecRouter from "./routes/openApiSpec";
import userRouter from "./routes/user";
import usersRouter from "./routes/users";
import verifyCredentialsRouter from "./routes/verifyCredentials";
import logger from "./utils/logger";

function createApp(): Express {
  const app = express();

  app.use(cors());

  app.use(express.json());

  app.use(
    morgan(
      ":remote-addr :method :url :status :res[content-length] - :response-time ms",
      {
        stream: {
          write: (message: string) => logger.info(message.trim()),
        },
      }
    )
  );

  app.get("/", (req: Request, res: Response) => {
    res.send(`
      <h1>Timeey API</h1>
      <p> Hello From Timeey API 😁 </p>
      <p>See <a href="/docs">/docs</a> for Swagger documentation</p>
      <p>See <a href="/redoc">/redoc</a> for Redoc documentation</p>
    `);
  });

  // documentation

  app.use("/openapi.json", openApiSpecRouter);

  app.use(
    "/docs",
    swaggerUI.serve,
    swaggerUI.setup(undefined, {
      swaggerOptions: {
        url: "/openapi.json",
      },
    })
  );

  app.use(
    "/redoc",
    redoc({
      title: "Timesheet API",
      specUrl: "/openapi.json",
    })
  );

  // routes

  app.use("/api/v1/verify-credentials", verifyCredentialsRouter);

  app.use("/api/v1/users", usersRouter);

  app.use("/api/v1/user", userRouter);

  app.use(errorController);

  return app;
}

export default createApp;
