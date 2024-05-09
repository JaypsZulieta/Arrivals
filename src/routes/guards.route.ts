import {
    BadRequestError,
    BedRequest,
    BedResponse,
    BedResponseBuilder,
    ForbiddenError,
    POSTRoute,
} from "hammockjs";
import { injectable, inject, container } from "tsyringe";
import {
    Guard,
    GuardDataBuilder,
    GuardFactory,
    GuardJSONBuilder,
    GuardJson,
} from "../factories/guard.factory";
import {
    Person,
    PersonDataBuilder,
    PersonFactory,
    PersonJSONBuilder,
} from "../factories/person.factory";
import { JwtService } from "jaypee-jwt-service";
import { PasswordEncoder } from "jaypee-password-encoder";

@injectable()
class GuardsRoute implements POSTRoute {
    constructor(
        @inject("guardFactory") private guardFactory: GuardFactory,
        @inject("personFactory") private personFactory: PersonFactory,
        @inject("jwtService") private jwtService: JwtService,
        @inject("passwordEncoder") private passwordEncoder: PasswordEncoder
    ) {}

    async POST(request: BedRequest): Promise<BedResponse> {
        const bearerToken = request.getHeader("Authorization")?.split("Bearer ")[1];
        if (!bearerToken) throw new ForbiddenError("forbidden");

        const jwtSecretKey = process.env.JWT_SECRET_KEY as string;
        const subject = await this.jwtService.validate(bearerToken, jwtSecretKey).catch(() => {
            throw new ForbiddenError("forbidden");
        });

        const user = await this.guardFactory.findByEmail(subject).catch(() => {
            throw new ForbiddenError("forbidden");
        });

        if (!user.isAdmin() || user.isDisbaled())
            throw new ForbiddenError("only admins can create new accounts");

        const requestBody = await request.getBody();
        const email = await requestBody.getString("email");
        const password = await requestBody.getString("password");
        const isAdmin = await requestBody.getBooleanOptional("isAdmin");
        const personalInfo = await requestBody.getObject("personalInfo");
        const firstname = await personalInfo.getString("firstname");
        const middlename = await personalInfo.getStringOptional("middlename");
        const lastname = await personalInfo.getString("lastname");
        const sex = await personalInfo.getString("sex");

        if (sex != "MALE" && sex != "FEMALE")
            throw new BadRequestError("sex must be either MALE or FEMALE");

        const hashPassword = await this.passwordEncoder.encode(password);

        const personData = new PersonDataBuilder()
            .firstname(firstname)
            .middlename(middlename)
            .lastname(lastname)
            .sex(sex)
            .build();
        const person = await this.personFactory.create(personData);

        const guardData = new GuardDataBuilder()
            .email(email)
            .password(hashPassword)
            .personId(person.getId())
            .isAdmin(isAdmin)
            .build();
        const guard = await this.guardFactory.create(guardData).catch(async (error) => {
            await person.delete();
            throw error;
        });

        return new BedResponseBuilder()
            .statusCode(201)
            .body(this.generateJSON(person, guard))
            .build();
    }

    generateJSON(person: Person, guard: Guard): GuardJson {
        const personJson = new PersonJSONBuilder()
            .firstname(person.getFirstname())
            .middlename(person.getMiddlename())
            .lastname(person.getLastname())
            .sex(person.getSex())
            .profileImageURL(person.getProfileImageURL())
            .timeAdded(person.getTimeAdded())
            .build();

        return new GuardJSONBuilder()
            .id(guard.getId())
            .email(guard.getEmail())
            .isAdmin(guard.isAdmin())
            .isDisabled(guard.isDisbaled())
            .person(personJson)
            .build();
    }

    getURI(): string {
        return "api/v1/guards";
    }
}

export const guardsRoute = container.resolve(GuardsRoute);
