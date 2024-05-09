import { PaginatedContent, PaginationOptions } from "../pagination";

type PersonData = {
    firstname: string;
    middlename?: string;
    lastname: string;
    sex: "MALE" | "FEMALE";
};

export abstract class Person {
    abstract getId(): number;
    abstract getFirstname(): string;
    abstract getMiddlename(): string | null;
    abstract getLastname(): string;
    abstract getSex(): "MALE" | "FEMALE";
    abstract getProfileImageURL(): string;
    abstract getTimeAdded(): Date;
    abstract updateFirstname(firstname: string): Promise<void>;
    abstract updateMiddlename(middlename: string | null): Promise<void>;
    abstract updateLastname(lastname: string): Promise<void>;
    abstract updateSex(sex: "MALE" | "FEMALE"): Promise<void>;
    abstract updateProfileImageURL(url: string): Promise<void>;
    abstract delete(): Promise<void>;
}

export abstract class PersonFactory {
    abstract create(data: PersonData): Promise<Person>;
    abstract findById(id: number): Promise<Person>;
    abstract findAll(
        options?: PaginationOptions
    ): Promise<PaginatedContent<Person>>;
    abstract existById(id: number): Promise<boolean>;
    abstract count(): Promise<number>;
}
