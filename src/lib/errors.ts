export type ServiceErrorCode = "validation" | "not_found" | "forbidden" | "closed";

export type FieldErrors = Record<string, string>;

export class ServiceError extends Error {
  constructor(
    public readonly code: ServiceErrorCode,
    message: string,
    public readonly fields: FieldErrors = {},
  ) {
    super(message);
    this.name = "ServiceError";
  }
}

const STATUS: Record<ServiceErrorCode, number> = {
  validation: 400,
  forbidden: 403,
  not_found: 404,
  closed: 409,
};

export function httpStatusFor(code: ServiceErrorCode): number {
  return STATUS[code];
}
