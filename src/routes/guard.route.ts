import {
    BadRequestError,
    BedRequest,
    BedResponse,
    BedResponseBuilder,
    ForbiddenError,
    GETRoute,
    PATCHRoute,
} from "hammockjs";
import { container, inject, injectable } from "tsyringe";
import { Guard, GuardFactory, GuardJSONBuilder, GuardJson } from "../factories/guard.factory";
import { JwtService } from "jaypee-jwt-service";
import { Person, PersonFactory, PersonJSONBuilder } from "../factories/person.factory";
import { PasswordEncoder } from "jaypee-password-encoder";

@injectable()
class GuardRoute implements GETRoute, PATCHRoute {
    constructor(
        @inject("guardFactory") private guardFactory: GuardFactory,
        @inject("personFactory") private personFactory: PersonFactory,
        @inject("passwordEncoder") private passwordEncoder: PasswordEncoder,
        @inject("jwtService") private jwtService: JwtService
    ) {}

    async GET(request: BedRequest): Promise<BedResponse> {
        const bearerToken = request.getHeader("Authorization")?.split("Bearer ")[1];
        if (!bearerToken) throw new ForbiddenError("forbidden");

        const jwtSecretKey = process.env.JWT_SECRET_KEY as string;
        const subject = await this.jwtService.validate(bearerToken, jwtSecretKey).catch((err) => {
            throw new ForbiddenError("forbidden");
        });

        const resourceId = request.getPathParameter("id");

        const user = await this.guardFactory.findByEmail(subject).catch(() => {
            throw new ForbiddenError("forbidden");
        });

        const guard = await this.guardFactory.findById(resourceId).catch(() => {
            throw new ForbiddenError("forbidden");
        });

        const person = await this.personFactory.findById(guard.getPersonId());

        const isNotOwner = user.getId() != resourceId;
        if (isNotOwner && !user.isAdmin()) throw new ForbiddenError("You do not own this resource");

        return new BedResponseBuilder()
            .statusCode(200)
            .body(this.generateJSON(person, guard))
            .build();
    }

    async PATCH(request: BedRequest): Promise<BedResponse> {
        const bearerToken = request.getHeader("Authorization")?.split("Bearer ")[1];
        if (!bearerToken) throw new ForbiddenError("forbidden");

        const jwtSecretKey = process.env.JWT_SECRET_KEY as string;
        const subject = await this.jwtService.validate(bearerToken, jwtSecretKey).catch((err) => {
            console.error(err);
            throw new ForbiddenError("forbidden");
        });

        const body = await request.getBody();
        const email = await body.getStringOptional("email");
        const password = await body.getStringOptional("password");
        const isAdmin = await body.getBooleanOptional("isAdmin");
        const isDisabled = await body.getBooleanOptional("isDisabled");
        const personalInfo = await body.getObjectOptional("personalInfo");
        const firstname = await personalInfo?.getStringOptional("firstname");
        const middlename = await personalInfo?.getStringOptional("middlename");
        const lastname = await personalInfo?.getStringOptional("lastname");
        const sex = await personalInfo?.getStringOptional("sex");

        if (sex && sex != "MALE" && sex != "FEMALE")
            throw new BadRequestError("sex must be either MALE or FEMALE");

        const resourceId = request.getPathParameter("id");

        const user = await this.guardFactory.findByEmail(subject).catch(() => {
            throw new ForbiddenError("forbidden");
        });

        const guard = await this.guardFactory.findById(resourceId).catch(() => {
            throw new ForbiddenError("forbidden");
        });

        const person = await this.personFactory.findById(guard.getPersonId());

        const isNotOwner = user.getId() != resourceId;
        if (isNotOwner && !user.isAdmin()) throw new ForbiddenError("forbidden");

        const admin = user.isAdmin();

        if (email) await guard.updateEmail(email);
        if (password) {
            const hashPassword = await this.passwordEncoder.encode(password);
            await guard.updatePassword(hashPassword);
        }

        if (admin && isAdmin != undefined && isNotOwner) await guard.updateAdminStatus(isAdmin);
        else if (admin && !isNotOwner && isAdmin != undefined)
            throw new ForbiddenError("You cannot change your own admin status");
        else if (!admin && isAdmin != undefined)
            throw new ForbiddenError("only admins can do that");

        if (isDisabled != undefined && isNotOwner && admin)
            await guard.updateDisabledStatus(isDisabled);
        else if (!isNotOwner && isDisabled != undefined)
            throw new ForbiddenError("you cannot disable your own account");
        else if (!admin && isAdmin != undefined)
            throw new ForbiddenError("only admins can disable accounts");

        if (firstname) await person.updateFirstname(firstname);
        if (middlename) await person.updateMiddlename(middlename);
        if (lastname) await person.updateLastname(lastname);
        if ((sex && sex == "MALE") || sex == "FEMALE") await person.updateSex(sex);

        return new BedResponseBuilder()
            .statusCode(200)
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
        return "api/v1/guards/:id";
    }
}

export const guardRoute = container.resolve(GuardRoute);
