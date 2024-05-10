import { Lifecycle, container } from "tsyringe";
import { ArgonPasswordEncoder, PasswordEncoder } from "jaypee-password-encoder";
import { GuardRepository, PrismaGuardRepository } from "./src/repositories/guard.repository";
import { PersonRepository, PrismaPersonRepository } from "./src/repositories/person.repository";
import { PersonService, StandardPersonService } from "./src/services/person.service";
import { GuardService, StandardGuardService } from "./src/services/guard.service";

container.register<PasswordEncoder>(
    "password",
    { useClass: ArgonPasswordEncoder },
    { lifecycle: Lifecycle.Singleton }
);

container.register<GuardRepository>(
    "guardRepository",
    { useClass: PrismaGuardRepository },
    { lifecycle: Lifecycle.Singleton }
);

container.register<PersonRepository>(
    "personRepository",
    { useClass: PrismaPersonRepository },
    { lifecycle: Lifecycle.Singleton }
);

container.register<PersonService>(
    "personService",
    { useClass: StandardPersonService },
    { lifecycle: Lifecycle.Singleton }
);

container.register<GuardService>(
    "guardService",
    { useClass: StandardGuardService },
    { lifecycle: Lifecycle.Singleton }
);
