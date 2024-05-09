import { inject, injectable } from "tsyringe";
import { ConflictError, NotFoundError } from "../errors.ts/index.js";
import { PaginationOptions, PaginatedContent } from "../pagination/index.js";
import { Guard, GuardFactory } from "./guard.factory";
import { PrismaClient, Guard as PrismaGuardData } from "@prisma/client";

export class PrismaGuard extends Guard {
    private id: string;
    private email: string;
    private password: string;
    private admin: boolean;
    private disabled: boolean;
    private personId: number;

    private prismaClient: PrismaClient;

    constructor(data: PrismaGuardData, prismaClient: PrismaClient) {
        super();
        this.id = data.id;
        this.email = data.email;
        this.password = data.password;
        this.admin = data.isAdmin;
        this.disabled = data.isDisabled;
        this.personId = data.personId;
        this.prismaClient = prismaClient;
    }

    private async emailTaken(): Promise<boolean> {
        const existingUser = await this.prismaClient.guard.findUnique({
            where: { email: this.getEmail() },
        });
        if (!existingUser) return false;
        if (existingUser.id != this.getId()) return false;
        return true;
    }

    async updateEmail(email: string): Promise<void> {
        if (await this.emailTaken())
            throw new ConflictError(`${email} is already taken`);
        const data = await this.prismaClient.guard.update({
            data: { email },
            where: { id: this.getId() },
        });
        this.email = data.email;
    }

    async updatePassword(password: string): Promise<void> {
        const data = await this.prismaClient.guard.update({
            data: { password },
            where: { id: this.getId() },
        });
        this.password = data.password;
    }

    async updateAdminStatus(status: boolean): Promise<void> {
        const data = await this.prismaClient.guard.update({
            data: { isAdmin: status },
            where: { id: this.getId() },
        });
        this.admin = data.isAdmin;
    }

    async updateDisabledStatus(status: boolean): Promise<void> {
        const data = await this.prismaClient.guard.update({
            data: { isDisabled: status },
            where: { id: this.getId() },
        });
        this.disabled = data.isDisabled;
    }

    getId(): string {
        return this.id;
    }
    getEmail(): string {
        return this.email;
    }
    getPassword(): string {
        return this.password;
    }
    isAdmin(): boolean {
        return this.admin;
    }
    isDisbaled(): boolean {
        return this.disabled;
    }
    getPersonId(): number {
        return this.personId;
    }
}

@injectable()
export class PrismaGuardFactory extends GuardFactory {
    constructor(@inject("prismaClient") private prismaClient: PrismaClient) {
        super();
    }

    async create(data: {
        email: string;
        password: string;
        isAdmin?: boolean | undefined;
        isDisabled?: boolean | undefined;
        personId: number;
    }): Promise<Guard> {
        if (await this.existByEmail(data.email))
            throw new ConflictError(`${data.email} is already taken`);
        const guardData = await this.prismaClient.guard.create({ data });
        return new PrismaGuard(guardData, this.prismaClient);
    }

    async findById(id: string): Promise<Guard> {
        const guardData = await this.prismaClient.guard.findUnique({
            where: { id },
        });
        if (!guardData) throw new NotFoundError(`guard ${id} does not exist`);
        return new PrismaGuard(guardData, this.prismaClient);
    }

    async findAll(
        options?: PaginationOptions | undefined
    ): Promise<PaginatedContent<Guard>> {
        const pageSize = options?.pageSize || 10;
        const currentPage = options?.pageNumber || 1;
        const totalItems = await this.count();
        const totalPages = Math.ceil(totalItems / pageSize);
        const skip = (currentPage - 1) * pageSize;
        const content = await this.prismaClient.guard
            .findMany({
                skip,
                take: pageSize,
            })
            .then((data) =>
                data.map((guard) => new PrismaGuard(guard, this.prismaClient))
            );
        return {
            totalItems,
            totalPages,
            content,
            currentPage,
        };
    }

    async count(): Promise<number> {
        return this.prismaClient.guard.count();
    }

    async existByEmail(email: string): Promise<boolean> {
        return (await this.prismaClient.guard.count({ where: { email } })) > 0;
    }

    async existById(id: string): Promise<boolean> {
        return (await this.prismaClient.guard.count({ where: { id } })) > 0;
    }

    async countAdmins(): Promise<number> {
        return await this.prismaClient.guard.count({
            where: { isAdmin: true },
        });
    }
}
