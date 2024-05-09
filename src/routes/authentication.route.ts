import {
    BedRequest,
    BedResponse,
    BedResponseBuilder,
    ForbiddenError,
    POSTRoute,
    PUTRoute,
} from "hammockjs";
import { PasswordEncoder } from "jaypee-password-encoder";
import { container, injectable, inject } from "tsyringe";
import { GuardFactory, GuardJSONBuilder } from "../factories/guard.factory";
import { JwtService } from "jaypee-jwt-service";
import { UnauthorizedError } from "../errors.ts";
import { PersonFactory, PersonJSONBuilder } from "../factories/person.factory";

@injectable()
class AuthenticationRoute implements POSTRoute, PUTRoute {
    constructor(
        @inject("passwordEncoder") private passwordEncoder: PasswordEncoder,
        @inject("guardFactory") private guardFactory: GuardFactory,
        @inject("jwtService") private jwtService: JwtService,
        @inject("personFactory") private personFactory: PersonFactory
    ) {}

    async POST(request: BedRequest): Promise<BedResponse> {
        const requestBody = await request.getBody();
        const email = await requestBody.getString("email");
        const password = await requestBody.getString("password");

        const errorMessage = "email or password is incorrect";
        const guard = await this.guardFactory.findByEmail(email).catch(() => {
            throw new UnauthorizedError(errorMessage);
        });

        const compareFailure = !(await this.passwordEncoder.validate(
            password,
            guard.getPassword()
        ));

        if (compareFailure) throw new UnauthorizedError(errorMessage);

        const jwtSecretKey = process.env.JWT_SECRET_KEY as string;
        const refreshTokenSecretKey = process.env.REFRESH_TOKEN_SECRET_KEY as string;

        const person = await this.personFactory.findById(guard.getPersonId());

        const accessToken = await this.jwtService.generateToken(guard.getEmail(), jwtSecretKey, {
            expiresIn: "10mins",
        });
        const refreshToken = await this.jwtService.generateToken(
            guard.getEmail(),
            refreshTokenSecretKey,
            { expiresIn: "8hrs" }
        );

        const personJson = new PersonJSONBuilder()
            .firstname(person.getFirstname())
            .middlename(person.getMiddlename())
            .lastname(person.getLastname())
            .sex(person.getSex())
            .profileImageURL(person.getProfileImageURL())
            .timeAdded(person.getTimeAdded())
            .build();

        const guardJson = new GuardJSONBuilder()
            .email(guard.getEmail())
            .id(guard.getId())
            .isAdmin(guard.isAdmin())
            .isDisabled(guard.isDisbaled())
            .person(personJson)
            .build();

        return new BedResponseBuilder()
            .statusCode(200)
            .body({ ...guardJson, accessToken, refreshToken })
            .build();
    }

    async PUT(request: BedRequest): Promise<BedResponse> {
        const bearerToken = request.getHeader("Authorization")?.split("Bearer ")[1];
        if (!bearerToken) throw new ForbiddenError("forbidden");

        const jwtSecretKey = process.env.JWT_SECRET_KEY as string;
        const refreshTokenSecretKey = process.env.REFRESH_TOKEN_SECRET_KEY as string;

        const subject = await this.jwtService
            .validate(bearerToken, refreshTokenSecretKey)
            .catch(() => {
                throw new ForbiddenError("forbidden");
            });

        const guard = await this.guardFactory.findByEmail(subject).catch(() => {
            throw new ForbiddenError("forbidden");
        });

        if (guard.isDisbaled()) throw new ForbiddenError("Your account is disabled");

        const accessToken = await this.jwtService.generateToken(subject, jwtSecretKey, {
            expiresIn: "10mins",
        });
        const refreshToken = await this.jwtService.generateToken(subject, refreshTokenSecretKey, {
            expiresIn: "8hrs",
        });

        return new BedResponseBuilder().statusCode(200).body({ accessToken, refreshToken }).build();
    }

    getURI(): string {
        return "api/v1/auth";
    }
}

export const authenticationRoute = container.resolve(AuthenticationRoute);
