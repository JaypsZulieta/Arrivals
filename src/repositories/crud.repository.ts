export type PaginationOptions = {
    pageSize?: number;
    pageNumber: number;
};

export type PaginatedContent<TContent> = {
    totalItems: number;
    totalPages: number;
    content: TContent[];
    currentPage: number;
};

export interface CRUDRepository<TData, TId> {
    create(data: TData): Promise<Required<TData>>;
    existById(id: TId): Promise<boolean>;
    count(): Promise<number>;
    findById(id: TId): Promise<Required<TData>>;
    findAll(options?: PaginationOptions): Promise<PaginatedContent<Required<TData>>>;
    update(data: Partial<TData>, id: TId): Promise<Required<TData>>;
    delete(id: TId): Promise<void>;
}
