import { PrismaClient } from "@prisma/client";
import { Lifecycle, container } from "tsyringe";
import { PrismaGuardFactory } from "./src/factories/prisma.guard.factory";
import { PrismaPersonFactory } from "./src/factories/prisma.person.factory";
import { ArgonPasswordEncoder } from "jaypee-password-encoder";
import { JwtServiceImpl } from "jaypee-jwt-service";

container.register("prismaClient", { useValue: new PrismaClient() });
container.register(
    "personFactory",
    { useClass: PrismaPersonFactory },
    { lifecycle: Lifecycle.Singleton }
);

container.register(
    "guardFactory",
    { useClass: PrismaGuardFactory },
    { lifecycle: Lifecycle.Singleton }
);

container.register(
    "passwordEncoder",
    { useClass: ArgonPasswordEncoder },
    { lifecycle: Lifecycle.Singleton }
);

container.register("jwtService", { useClass: JwtServiceImpl }, { lifecycle: Lifecycle.Singleton });
