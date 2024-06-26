import { PaginatedContent, PaginationOptions } from "../pagination";

type PersonData = {
    firstname: string;
    middlename?: string;
    lastname: string;
    sex: "MALE" | "FEMALE";
};

export class PersonDataBuilder {
    private firstnameAttribute: string = "";
    private middlenameAttribute?: string = "";
    private lastnameAttribute: string = "";
    private sexAttribute: "MALE" | "FEMALE" = "MALE";

    firstname(firstname: string): PersonDataBuilder {
        this.firstnameAttribute = firstname;
        return this;
    }

    middlename(middlename?: string): PersonDataBuilder {
        this.middlenameAttribute = middlename;
        return this;
    }

    lastname(lastname: string): PersonDataBuilder {
        this.lastnameAttribute = lastname;
        return this;
    }

    sex(sex: "MALE" | "FEMALE"): PersonDataBuilder {
        this.sexAttribute = sex;
        return this;
    }

    build(): PersonData {
        return {
            firstname: this.firstnameAttribute,
            middlename: this.middlenameAttribute,
            lastname: this.lastnameAttribute,
            sex: this.sexAttribute,
        };
    }
}

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
    abstract findAll(options?: PaginationOptions): Promise<PaginatedContent<Person>>;
    abstract existById(id: number): Promise<boolean>;
    abstract count(): Promise<number>;
}

export type PersonJson = {
    firstname?: string;
    middlename?: string | null;
    lastname?: string;
    sex?: "MALE" | "FEMALE";
    profileImageURL?: string;
    timeAdded?: Date;
};

export class PersonJSONBuilder {
    private firstnameAttribute?: string;
    private middlenameAttribute?: string | null;
    private lastnameAttribute?: string;
    private sexAttribute?: "MALE" | "FEMALE";
    private profileImageURLAttribute?: string;
    private timeAddedAttribute?: Date;

    firstname(firstname?: string): PersonJSONBuilder {
        this.firstnameAttribute = firstname;
        return this;
    }

    middlename(middlename?: string | null): PersonJSONBuilder {
        this.middlenameAttribute = middlename;
        return this;
    }

    lastname(lastname?: string): PersonJSONBuilder {
        this.lastnameAttribute = lastname;
        return this;
    }

    sex(sex?: "MALE" | "FEMALE"): PersonJSONBuilder {
        this.sexAttribute = sex;
        return this;
    }

    profileImageURL(profileImageURL?: string): PersonJSONBuilder {
        this.profileImageURLAttribute = profileImageURL;
        return this;
    }

    timeAdded(timeAdded?: Date): PersonJSONBuilder {
        this.timeAddedAttribute = timeAdded;
        return this;
    }

    build(): PersonJson {
        return {
            firstname: this.firstnameAttribute,
            middlename: this.middlenameAttribute,
            lastname: this.lastnameAttribute,
            sex: this.sexAttribute,
            profileImageURL: this.profileImageURLAttribute,
            timeAdded: this.timeAddedAttribute,
        };
    }
}
