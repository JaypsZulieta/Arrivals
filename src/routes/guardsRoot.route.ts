import "reflect-metadata";
import "../../app.config";
import { GuardFactory } from "../factories/guard.factory";
import { PersonFactory } from "../factories/person.factory";
import { container, inject, injectable } from "tsyringe";
import { PasswordEncoder } from "jaypee-password-encoder";
import {
    BadRequestError,
    BedRequest,
    BedResponse,
    BedResponseBuilder,
    POSTRoute,
} from "hammockjs";
import { ConflictError } from "../errors.ts";

@injectable()
class GuardRoot implements POSTRoute {
    private guardFactory: GuardFactory;
    private personFactory: PersonFactory;
    private passwordEncoder: PasswordEncoder;

    constructor(
        @inject("guardFactory") guardFactory: GuardFactory,
        @inject("personFactory") personFacotry: PersonFactory,
        @inject("passwordEncoder") passwordEncoder: PasswordEncoder
    ) {
        this.guardFactory = guardFactory;
        this.personFactory = personFacotry;
        this.passwordEncoder = passwordEncoder;
    }

    getURI(): string {
        return "api/v1/guards/root";
    }

    async POST(request: BedRequest): Promise<BedResponse> {
        const requestBody = await request.getBody();
        const email = await requestBody.getString("email");
        const password = await requestBody.getString("password");
        const personalInfo = await requestBody.getObject("personalInfo");
        const firstname = await personalInfo.getString("firstname");
        const middlename = await personalInfo.getStringOptional("middlename");
        const lastname = await personalInfo.getString("lastname");
        const sex = await personalInfo.getString("sex");

        if (sex != "MALE" && sex != "FEMALE")
            throw new BadRequestError("sex must be either MALE or FEMALE");

        if ((await this.guardFactory.countAdmins()) > 0)
            throw new ConflictError("there is already an admin in the system");

        const person = await this.personFactory.create({
            firstname,
            middlename,
            lastname,
            sex,
        });
        const guard = await this.guardFactory
            .create({
                email,
                password,
                personId: person.getId(),
            })
            .catch(async (error) => {
                await person.delete();
                throw error;
            });

        const hashPassword = await this.passwordEncoder.encode(
            guard.getPassword()
        );
        await guard.updateAdminStatus(true);
        await guard.updatePassword(hashPassword);

        return new BedResponseBuilder()
            .statusCode(201)
            .body({
                id: guard.getId(),
                email: guard.getEmail(),
                isAdmin: guard.isAdmin(),
                isDisabled: guard.isDisbaled(),
                personalInfo: {
                    firstname: person.getFirstname(),
                    middlename: person.getMiddlename(),
                    lastname: person.getLastname(),
                    sex: person.getSex(),
                    profileImageURL: person.getProfileImageURL(),
                },
            })
            .build();
    }
}

export const guardRoot = container.resolve(GuardRoot);
