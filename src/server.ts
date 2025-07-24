import express, { Router } from "express";
import cors from "cors";
import { Request, Response, Express } from "express";

// definition des types
export type GetterFunction = (req: Request, res: Response) => void;

export default class Server {
  readonly port: number = 3000;
  protected app: Express | undefined;

  constructor(port: number) {
    this.port = port;
  }

  start() {
    const corsOptions = {
      origin: "*",
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
      credentials: true,
      optionsSuccessStatus: 204,
    };

    this.app = express();
    this.app.use(cors(corsOptions));
    this.app.use(express.json()); // Middleware pour parser le JSON

    this.app.get("/", (req: Request, res: Response) => {
      res.send("Hello World!");
    });

    // Ecoutons...
    this.app.listen(this.port, () => {
      console.log(`App listening on port http://localhost:${this.port}`);
    });
  }

  // fonction qui gere le get sur un endpoint
  get(endpoint: string, getter: GetterFunction) {
    this.app?.get(`${endpoint}`, getter);
  }

  // endpoint qui permet de gerer un router
  use(endpoint: string, router: Router) {
    this.app?.use(endpoint, router);
  }
}
