import { BedRequest } from "hammockjs";
import { Guard, Person } from "../entities";

export class GuardFactory {
    async create(request: BedRequest, personId: number): Promise<Guard> {
        const requestBody = await request.getBody();
        const email = await requestBody.getString("email");
        const password = await requestBody.getString("password");
        const isAdmin = await requestBody.getBooleanOptional("isAdmin");
        return {
            email,
            password,
            isAdmin,
            personId,
        } satisfies Guard;
    }
}
