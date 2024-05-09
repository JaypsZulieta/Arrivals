import { BedResponse, BedResponseBuilder, HttpError } from "hammockjs";

export class NotFoundError extends HttpError {
    constructor(message: string) {
        super(message);
    }

    async sendResponse(): Promise<BedResponse> {
        const message = this.message;
        return new BedResponseBuilder()
            .statusCode(404)
            .body({ message })
            .build();
    }
}

export class ConflictError extends HttpError {
    constructor(message: string) {
        super(message);
    }

    async sendResponse(): Promise<BedResponse> {
        const message = this.message;
        return new BedResponseBuilder()
            .statusCode(409)
            .body({ message })
            .build();
    }
}
