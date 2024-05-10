import { BedRequest, BedResponse, BedResponseBuilder, POSTRoute } from "hammockjs";
import { GuardService } from "../services/guard.service";
import { autoInjectable, container, inject } from "tsyringe";
import { PersonService } from "../services/person.service";
import { PersonFactory } from "../factories/person.factory";
import { GuardFactory } from "../factories/guard.factory";

@autoInjectable()
class GuardsRoute implements POSTRoute {
    constructor(
        @inject("guardService") private guardService: GuardService,
        @inject("personService") private personService: PersonService,
        @inject("personFactory") private personFactory: PersonFactory,
        @inject("guardFactory") private guardFactory: GuardFactory
    ) {}

    async POST(request: BedRequest): Promise<BedResponse> {
        const personData = await this.personFactory.create(request);
        const person = await this.personService.create(personData);

        const guardData = await this.guardFactory.create(request, person.id);
        const guard = await this.guardService.create(guardData);

        return new BedResponseBuilder().statusCode(201).body(guard).build();
    }

    getURI(): string {
        return "api/v1/guards";
    }
}

export const guardRoute = container.resolve(GuardsRoute);
