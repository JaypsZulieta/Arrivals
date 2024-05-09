export type PaginationOptions = {
    pageNumber: number;
    pageSize?: number;
};

export type PaginatedContent<TContent> = {
    totalItems: number;
    totalPages: number;
    content: TContent[];
    currentPage: number;
};
