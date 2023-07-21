import StatusCodes from "./statusCodes";

class PamnaniError extends Error {
  type: string;
  message: string;
  code: StatusCodes;
  data: unknown;

  constructor(
    type: string,
    message: string,
    code?: StatusCodes,
    data?: unknown
  ) {
    super(message);
    this.type = type;
    this.message = message;
    this.code = code ?? StatusCodes.INTERNAL_SERVER_ERROR;
    this.data = data;
  }

  toJSON(): Record<string, unknown> {
    return {
      type: this.type,
      message: this.message,
      code: this.code,
      data: this.data,
    };
  }

  static fromObject(obj: {
    type: string;
    message: string;
    code: StatusCodes;
    data?: unknown;
  }): PamnaniError {
    return new PamnaniError(obj.type, obj.message, obj.code, obj.data);
  }
}

export default PamnaniError;
