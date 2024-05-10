import { BadRequestError, BedRequest } from "hammockjs";
import { Person } from "../entities";

export class PersonFactory {
    async create(request: BedRequest): Promise<Person> {
        const requestBody = await request.getBody();
        const firstname = await requestBody.getString("firstname");
        const middlename = await requestBody.getStringOptional("middlename");
        const lastname = await requestBody.getString("lastname");
        const sex = await requestBody.getString("sex");
        if (sex != "MALE" && sex != "FEMALE")
            throw new BadRequestError("sex must be either MALE or FEMALE");
        return {
            firstname,
            middlename,
            lastname,
            sex,
        } satisfies Person;
    }
}
