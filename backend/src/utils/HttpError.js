export class HttpError extends Error {
    constructor(status, message, field = null){
        super(message);
        this.status = status;
        this.field = field;
    }
}