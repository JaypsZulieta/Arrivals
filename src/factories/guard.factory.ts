import { PaginatedContent, PaginationOptions } from "../pagination";

type GuardData = {
    email: string;
    password: string;
    isAdmin?: boolean;
    isDisabled?: boolean;
    personId: number;
};

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
