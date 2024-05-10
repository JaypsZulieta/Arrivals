import { inject, injectable } from "tsyringe";
import { Guard } from "../entities";
import { PaginatedContent, PaginationOptions } from "../repositories/crud.repository";
import { GuardRepository } from "../repositories/guard.repository";

export interface GuardService {
    create(data: Guard): Promise<Required<Guard>>;
    count(): Promise<number>;
    existById(id: string): Promise<boolean>;
    findById(id: string): Promise<Required<Guard>>;
    findAll(options?: PaginationOptions): Promise<PaginatedContent<Required<Guard>>>;
    update(data: Partial<Guard>, id: string): Promise<Required<Guard>>;
    delete(id: string): Promise<void>;
}

@injectable()
export class StandardGuardService implements GuardService {
    constructor(@inject("guardRepository") private guardRepository: GuardRepository) {}

    create(data: Guard): Promise<Required<Guard>> {
        return this.guardRepository.create(data);
    }

    count(): Promise<number> {
        return this.guardRepository.count();
    }

    existById(id: string): Promise<boolean> {
        return this.guardRepository.existById(id);
    }

    findById(id: string): Promise<Required<Guard>> {
        return this.guardRepository.findById(id);
    }

    findAll(options?: PaginationOptions | undefined): Promise<PaginatedContent<Required<Guard>>> {
        return this.guardRepository.findAll(options);
    }

    update(data: Partial<Guard>, id: string): Promise<Required<Guard>> {
        return this.guardRepository.update(data, id);
    }

    delete(id: string): Promise<void> {
        return this.guardRepository.delete(id);
    }
}
