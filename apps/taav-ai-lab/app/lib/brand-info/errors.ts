export class BrandInfoError extends Error {
  constructor(public readonly code: string, message: string, public readonly status = 400) {
    super(message);
    this.name = 'BrandInfoError';
  }
}

export class BrandInfoNotFoundError extends BrandInfoError {
  constructor(message = 'Brand Info پیدا نشد.') { super('NOT_FOUND', message, 404); }
}

export class BrandInfoForbiddenError extends BrandInfoError {
  constructor(message = 'دسترسی به این Brand Info مجاز نیست.') { super('FORBIDDEN', message, 403); }
}

export class BrandInfoConflictError extends BrandInfoError {
  constructor(public readonly current: unknown, message = 'این منبع توسط کاربر دیگری تغییر کرده است.') {
    super('CONFLICT', message, 409);
  }
}

export class BrandInfoUnsupportedMediaError extends BrandInfoError {
  constructor(message: string) { super('UNSUPPORTED_MEDIA', message, 415); }
}

export class BrandInfoFileTooLargeError extends BrandInfoError {
  constructor(message: string) { super('FILE_TOO_LARGE', message, 413); }
}
