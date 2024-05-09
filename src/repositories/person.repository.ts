import { PrismaClient } from "@prisma/client";
import { Person } from "../entities";
import { CRUDRepository, PaginatedContent, PaginationOptions } from "./crud.repository";
import { inject, injectable } from "tsyringe";
import { ConflictError, NotFoundError } from "../errors";

export interface PersonRepository extends CRUDRepository<Person, number> {}

@injectable()
export class PrismaPersonRepository implements PersonRepository {
    constructor(@inject("prismaClient") private prismaClient: PrismaClient) {}

    async create(data: Person): Promise<Required<Person>> {
        if (data.id && (await this.existById(data.id)))
            throw new ConflictError(`${data.id} already exists`);
        return await this.prismaClient.person.create({ data });
    }

    async existById(id: number): Promise<boolean> {
        return (await this.prismaClient.person.count({ where: { id } })) > 0;
    }

    async count(): Promise<number> {
        return await this.prismaClient.person.count();
    }

    async findById(id: number): Promise<Required<Person>> {
        const person = await this.prismaClient.person.findUnique({ where: { id } });
        if (!person) throw new NotFoundError(`${id} not found`);
        return person;
    }

    async findAll(
        options?: PaginationOptions | undefined
    ): Promise<PaginatedContent<Required<Person>>> {
        const totalItems = await this.count();
        const pageSize = options?.pageSize || 20;
        const currentPage = options?.pageNumber || 1;
        const skip = (currentPage - 1) * pageSize;
        const totalPages = Math.ceil(totalItems / pageSize);
        const content = await this.prismaClient.person.findMany({
            take: pageSize,
            skip,
            orderBy: { timeAdded: "desc" },
        });
        return { totalItems, totalPages, content, currentPage };
    }

    async update(data: Partial<Person>, id: number): Promise<Required<Person>> {
        if (!(await this.existById(id))) throw new NotFoundError(`${id} record not found`);
        return await this.prismaClient.person.update({ data, where: { id } }).catch((error) => {
            console.error(error);
            throw new ConflictError(`${id} record not found`);
        });
    }

    async delete(id: number): Promise<void> {
        if (!(await this.existById(id))) throw new NotFoundError(`${id} record not found`);
        await this.prismaClient.person.delete({ where: { id } });
    }
}
