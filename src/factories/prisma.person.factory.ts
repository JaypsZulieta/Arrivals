import { inject, injectable } from "tsyringe";
import { NotFoundError } from "../errors.ts/index.js";
import { PaginationOptions, PaginatedContent } from "../pagination/index.js";
import { Person, PersonFactory } from "./person.factory";
import { PrismaClient, Person as PrismaPersonData } from "@prisma/client";

class PrismaPerson extends Person {
    private id: number;
    private firstname: string;
    private middlename: string | null;
    private lastname: string;
    private sex: "MALE" | "FEMALE";
    private profileImageURL: string;
    private timeAdded: Date;

    private prismaClient: PrismaClient;

    constructor(data: PrismaPersonData, prismClient: PrismaClient) {
        super();
        this.id = data.id;
        this.firstname = data.firstname;
        this.middlename = data.middlename;
        this.lastname = data.lastname;
        this.sex = data.sex;
        this.profileImageURL = data.profileImageURL;
        this.timeAdded = data.timeAdded;
        this.prismaClient = prismClient;
    }

    async updateFirstname(firstname: string): Promise<void> {
        const data = await this.prismaClient.person.update({
            data: { firstname },
            where: { id: this.getId() },
        });
        this.firstname = data.firstname;
    }

    async updateMiddlename(middlename: string | null): Promise<void> {
        const data = await this.prismaClient.person.update({
            data: { middlename },
            where: { id: this.getId() },
        });
        this.middlename = data.middlename;
    }

    async updateLastname(lastname: string): Promise<void> {
        const data = await this.prismaClient.person.update({
            data: { lastname },
            where: { id: this.getId() },
        });
        this.lastname = data.lastname;
    }

    async updateSex(sex: "MALE" | "FEMALE"): Promise<void> {
        const data = await this.prismaClient.person.update({
            data: { sex },
            where: { id: this.getId() },
        });
        this.sex = data.sex;
    }

    async updateProfileImageURL(url: string): Promise<void> {
        const data = await this.prismaClient.person.update({
            data: { profileImageURL: url },
            where: { id: this.getId() },
        });
        this.profileImageURL = data.profileImageURL;
    }

    async delete(): Promise<void> {
        await this.prismaClient.person.delete({ where: { id: this.getId() } });
    }

    getId(): number {
        return this.id;
    }

    getFirstname(): string {
        return this.firstname;
    }

    getMiddlename(): string | null {
        return this.middlename;
    }

    getLastname(): string {
        return this.lastname;
    }
    getSex(): "MALE" | "FEMALE" {
        return this.sex;
    }

    getProfileImageURL(): string {
        return this.profileImageURL;
    }

    getTimeAdded(): Date {
        return this.timeAdded;
    }
}

@injectable()
export class PrismaPersonFactory extends PersonFactory {
    constructor(@inject("prismaClient") private prismaClient: PrismaClient) {
        super();
    }

    async create(data: {
        firstname: string;
        middlename?: string | undefined;
        lastname: string;
        sex: "MALE" | "FEMALE";
    }): Promise<Person> {
        const prismaData = await this.prismaClient.person.create({ data });
        return new PrismaPerson(prismaData, this.prismaClient);
    }

    async findById(id: number): Promise<Person> {
        const data = await this.prismaClient.person.findUnique({
            where: { id },
        });
        if (!data)
            throw new NotFoundError(`person with id ${id} does not exist`);
        return new PrismaPerson(data, this.prismaClient);
    }

    async findAll(
        options?: PaginationOptions | undefined
    ): Promise<PaginatedContent<Person>> {
        const pageSize = options?.pageSize || 10;
        const currentPage = options?.pageNumber || 1;
        const totalItems = await this.prismaClient.person.count();
        const totalPages = Math.ceil(totalItems / pageSize);
        const skip = (currentPage - 1) * pageSize;
        const data = await this.prismaClient.person.findMany({
            take: pageSize,
            skip,
        });
        const content = data.map(
            (data) => new PrismaPerson(data, this.prismaClient)
        );
        return {
            totalItems,
            totalPages,
            content,
            currentPage,
        };
    }

    async count(): Promise<number> {
        return await this.prismaClient.person.count();
    }

    async existById(id: number): Promise<boolean> {
        return (await this.prismaClient.person.count({ where: { id } })) > 0;
    }
}
