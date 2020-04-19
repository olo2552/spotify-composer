import { Express } from "express";
import cors from "cors";

export default (app: Express) => {
  const isDev = process.env.NODE_ENV === "development";
  const port = process.env.CRA_DEVSERVER_PORT || 3001;

  if (isDev) {
    app.use(
      cors({
        origin: `http://localhost:${port}`,
        credentials: true,
      })
    );
  }
};
