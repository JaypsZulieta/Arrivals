import { BedRequest, BedResponse, BedResponseBuilder, ForbiddenError, GETRoute } from "hammockjs";
import { container, inject, injectable } from "tsyringe";
import { GuardFactory, GuardJSONBuilder } from "../factories/guard.factory";
import { JwtService } from "jaypee-jwt-service";
import { PersonFactory, PersonJSONBuilder } from "../factories/person.factory";

@injectable()
class GuardRoute implements GETRoute {
    constructor(
        @inject("guardFactory") private guardFactory: GuardFactory,
        @inject("personFactory") private personFactory: PersonFactory,
        @inject("jwtService") private jwtService: JwtService
    ) {}

    async GET(request: BedRequest): Promise<BedResponse> {
        const bearerToken = request.getHeader("Authorization")?.split("Bearer ")[1];
        if (!bearerToken) throw new ForbiddenError("forbidden");

        const jwtSecretKey = process.env.JWT_SECRET_KEY as string;
        const subject = await this.jwtService.validate(bearerToken, jwtSecretKey).catch(() => {
            throw new ForbiddenError("forbidden");
        });

        const guard = await this.guardFactory.findByEmail(subject).catch((err) => {
            throw new ForbiddenError("forbidden");
        });

        const person = await this.personFactory.findById(guard.getPersonId());
        const resourceId = request.getPathParameter("id");

        const isNotOwner = guard.getId() != resourceId;
        if (isNotOwner) throw new ForbiddenError("You do not own this resource");

        const personJson = new PersonJSONBuilder()
            .firstname(person.getFirstname())
            .middlename(person.getMiddlename())
            .lastname(person.getLastname())
            .sex(person.getSex())
            .profileImageURL(person.getProfileImageURL())
            .timeAdded(person.getTimeAdded())
            .build();

        const guardJson = new GuardJSONBuilder()
            .id(guard.getId())
            .email(guard.getEmail())
            .isAdmin(guard.isAdmin())
            .isDisabled(guard.isDisbaled())
            .person(personJson)
            .build();

        return new BedResponseBuilder().statusCode(200).body(guardJson).build();
    }

    getURI(): string {
        return "api/v1/guards/:id";
    }
}

export const guardRoute = container.resolve(GuardRoute);
