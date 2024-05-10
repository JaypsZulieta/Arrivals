import { inject, injectable } from "tsyringe";
import { Guard, Person } from "../entities";
import { PaginatedContent, PaginationOptions } from "../repositories/crud.repository";
import { PersonRepository } from "../repositories/person.repository";

export interface PersonService {
    create(data: Person): Promise<Required<Person>>;
    count(): Promise<number>;
    existById(id: number): Promise<boolean>;
    findById(id: number): Promise<Required<Person>>;
    findAll(options?: PaginationOptions): Promise<PaginatedContent<Required<Person>>>;
    update(data: Partial<Person>, id: number): Promise<Required<Person>>;
    delete(id: number): Promise<void>;
}

@injectable()
export class StandardPersonService implements PersonService {
    constructor(@inject("personRepository") private personRepository: PersonRepository) {}

    create(data: Person): Promise<Required<Person>> {
        return this.personRepository.create(data);
    }

    count(): Promise<number> {
        return this.personRepository.count();
    }

    existById(id: number): Promise<boolean> {
        return this.personRepository.existById(id);
    }

    findById(id: number): Promise<Required<Person>> {
        return this.personRepository.findById(id);
    }

    findAll(options?: PaginationOptions | undefined): Promise<PaginatedContent<Required<Person>>> {
        return this.personRepository.findAll(options);
    }

    update(data: Partial<Person>, id: number): Promise<Required<Person>> {
        return this.personRepository.update(data, id);
    }

    delete(id: number): Promise<void> {
        return this.personRepository.delete(id);
    }
}
