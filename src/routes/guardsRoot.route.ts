import "reflect-metadata";
import "../../app.config";
import { BadRequestError, BedRequest, BedResponse, BedResponseBuilder, POSTRoute } from "hammockjs";
import { GuardDataBuilder, GuardFactory, GuardJSONBuilder } from "../factories/guard.factory";
import { PersonDataBuilder, PersonFactory, PersonJSONBuilder } from "../factories/person.factory";
import { container, inject, injectable } from "tsyringe";
import { PasswordEncoder } from "jaypee-password-encoder";
import { ConflictError } from "../errors.ts";
import { JwtService } from "jaypee-jwt-service";

@injectable()
class GuardRoot implements POSTRoute {
    private guardFactory: GuardFactory;
    private personFactory: PersonFactory;
    private passwordEncoder: PasswordEncoder;
    private jwtService: JwtService;

    constructor(
        @inject("guardFactory") guardFactory: GuardFactory,
        @inject("personFactory") personFacotry: PersonFactory,
        @inject("passwordEncoder") passwordEncoder: PasswordEncoder,
        @inject("jwtService") jwtService: JwtService
    ) {
        this.guardFactory = guardFactory;
        this.personFactory = personFacotry;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
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

        const personData = new PersonDataBuilder()
            .firstname(firstname)
            .middlename(middlename)
            .lastname(lastname)
            .sex(sex)
            .build();
        const person = await this.personFactory.create(personData);

        const guardData = new GuardDataBuilder()
            .email(email)
            .password(password)
            .personId(person.getId())
            .build();
        const guard = await this.guardFactory.create(guardData).catch(async (error) => {
            await person.delete();
            throw error;
        });

        const plainTextPassword = guard.getPassword();
        const hashPassword = await this.hash(plainTextPassword);

        await guard.updateAdminStatus(true);
        await guard.updatePassword(hashPassword);

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

        const jwtSecretKey = process.env.JWT_SECRET_KEY as string;
        const refreshTokenSecretKey = process.env.REFRESH_TOKEN_SECRET_KEY as string;

        const accessToken = await this.jwtService.generateToken(guard.getEmail(), jwtSecretKey, {
            expiresIn: "10mins",
        });
        const refreshToken = await this.jwtService.generateToken(
            guard.getEmail(),
            refreshTokenSecretKey,
            { expiresIn: "8hrs" }
        );

        return new BedResponseBuilder()
            .statusCode(201)
            .body({ ...guardJson, accessToken, refreshToken })
            .build();
    }

    private async hash(plainTextPassword: string): Promise<string> {
        return await this.passwordEncoder.encode(plainTextPassword);
    }
}

export const guardRoot = container.resolve(GuardRoot);
