import { PrismaClient } from "@prisma/client";
import { Guard } from "../entities";
import { CRUDRepository, PaginatedContent, PaginationOptions } from "./crud.repository";
import { inject, injectable } from "tsyringe";
import { ConflictError, NotFoundError } from "../errors";

export interface GuardRepository extends CRUDRepository<Guard, string> {
    existByEmail(email: string): Promise<boolean>;
    findByEmail(email: string): Promise<Required<Guard>>;
}

@injectable()
export class PrismaGuardRepository implements GuardRepository {
    constructor(@inject("prismaClient") private prismaClient: PrismaClient) {}

    async existByEmail(email: string): Promise<boolean> {
        return (await this.prismaClient.guard.count({ where: { email } })) > 0;
    }

    async findByEmail(email: string): Promise<Required<Guard>> {
        const guard = await this.prismaClient.guard.findUnique({ where: { email } });
        if (!guard) throw new NotFoundError(`${email} not found`);
        return guard;
    }

    async create(data: Guard): Promise<Required<Guard>> {
        if (data.id && (await this.existById(data.id)))
            throw new NotFoundError(`${data.id} record not found`);
        if (await this.existByEmail(data.email)) throw new NotFoundError(`${data.email} not found`);
        return await this.prismaClient.guard.create({ data });
    }

    async existById(id: string): Promise<boolean> {
        return (await this.prismaClient.guard.count({ where: { id } })) > 0;
    }

    async count(): Promise<number> {
        return await this.prismaClient.guard.count();
    }

    async findById(id: string): Promise<Required<Guard>> {
        const guard = await this.prismaClient.guard.findUnique({ where: { id } });
        if (!guard) throw new NotFoundError(`${id} record not found`);
        return guard;
    }

    async findAll(
        options?: PaginationOptions | undefined
    ): Promise<PaginatedContent<Required<Guard>>> {
        const pageSize = options?.pageSize || 20;
        const currentPage = options?.pageNumber || 1;
        const totalItems = await this.count();
        const totalPages = Math.ceil(totalItems / pageSize);
        const skip = (currentPage - 1) * pageSize;
        const content = await this.prismaClient.guard.findMany({
            orderBy: { Person: { timeAdded: "desc" } },
            skip,
            take: pageSize,
        });
        return { totalItems, totalPages, content, currentPage };
    }

    async update(data: Partial<Guard>, id: string): Promise<Required<Guard>> {
        return await this.prismaClient.guard.update({ data, where: { id } }).catch((error) => {
            console.error(error);
            throw new ConflictError("email or id is already taken");
        });
    }

    async delete(id: string): Promise<void> {
        if (!(await this.existById(id))) throw new NotFoundError(`${id} record not found`);
        await this.prismaClient.guard.delete({ where: { id } });
    }
}
