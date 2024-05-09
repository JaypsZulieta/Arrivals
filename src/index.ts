import "reflect-metadata";
import "../app.config";
import { Hammock } from "hammockjs";
import { guardRoot } from "./routes/guardsRoot.route";

const hammock = new Hammock(8080);

hammock.addPOSTRoute(guardRoot);

hammock.rest();
