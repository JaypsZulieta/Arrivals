import "reflect-metadata";
import "../app.config";
import { Hammock } from "hammockjs";
import { guardRoot } from "./routes/guardsRoot.route";
import { authenticationRoute } from "./routes/authentication.route";
import { guardRoute } from "./routes/guard.route";
import { guardsRoute } from "./routes/guards.route";

const hammock = new Hammock(8080);

hammock.addPOSTRoute(authenticationRoute);
hammock.addPUTRoute(authenticationRoute);

hammock.addPATCHRoute(guardRoute);
hammock.addPOSTRoute(guardRoot);
hammock.addGETRoute(guardRoute);

hammock.addPOSTRoute(guardsRoute);

hammock.rest();
