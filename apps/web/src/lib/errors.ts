export class ApiError extends Error {
  public code: string;
  public fields?: Record<string, string>;
  public requestId?: string;

  constructor(code: string, message: string, fields?: Record<string, string>, requestId?: string) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.fields = fields;
    this.requestId = requestId;
  }
}

export function getFriendlyErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.code) {
      case "AUTH_REQUIRED":
        return "You need to be logged in to do this.";
      case "FORBIDDEN":
        return "You don't have permission to do this.";
      case "NOT_FOUND":
        return "We couldn't find what you were looking for.";
      case "CONFLICT":
        return "There was a conflict (e.g., this item already exists).";
      case "VALIDATION_ERROR":
        return "Please check the information you entered.";
      case "BAD_REQUEST":
        return "Something went wrong with the request.";
      case "INTERNAL_ERROR":
      default:
        return "We hit a bump. Please try again.";
    }
  }
  if (error instanceof Error) {
    return error.message || "We hit a bump. Please try again.";
  }
  return "We hit a bump. Please try again.";
}
