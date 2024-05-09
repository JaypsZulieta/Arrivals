import { PaginatedContent, PaginationOptions } from "../pagination";

type GuardData = {
    email: string;
    password: string;
    isAdmin?: boolean;
    isDisabled?: boolean;
    personId: number;
};

export class GuardDataBuilder {
    private emailAttribute!: string;
    private passwordAttribute!: string;
    private isAdminAttribute?: boolean;
    private isDisabledAttribute?: boolean;
    private personIdAttribute!: number;

    email(email: string): GuardDataBuilder {
        this.emailAttribute = email;
        return this;
    }

    password(password: string): GuardDataBuilder {
        this.passwordAttribute = password;
        return this;
    }

    isAdmin(status: boolean): GuardDataBuilder {
        this.isAdminAttribute = status;
        return this;
    }

    isDisabled(status: boolean): GuardDataBuilder {
        this.isDisabledAttribute = status;
        return this;
    }

    personId(personId: number): GuardDataBuilder {
        this.personIdAttribute = personId;
        return this;
    }

    build(): GuardData {
        return {
            email: this.emailAttribute,
            password: this.passwordAttribute,
            isAdmin: this.isAdminAttribute,
            isDisabled: this.isDisabledAttribute,
            personId: this.personIdAttribute,
        };
    }
}

export abstract class Guard {
    abstract getId(): string;
    abstract getEmail(): string;
    abstract getPassword(): string;
    abstract isAdmin(): boolean;
    abstract isDisbaled(): boolean;
    abstract getPersonId(): number;
    abstract updateEmail(email: string): Promise<void>;
    abstract updatePassword(password: string): Promise<void>;
    abstract updateAdminStatus(status: boolean): Promise<void>;
    abstract updateDisabledStatus(status: boolean): Promise<void>;
}

export abstract class GuardFactory {
    abstract create(data: GuardData): Promise<Guard>;
    abstract findById(id: string): Promise<Guard>;
    abstract findAll(
        options?: PaginationOptions
    ): Promise<PaginatedContent<Guard>>;
    abstract existById(id: string): Promise<boolean>;
    abstract count(): Promise<number>;
    abstract countAdmins(): Promise<number>;
}
