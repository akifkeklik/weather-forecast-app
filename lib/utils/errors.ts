import { WeatherError } from '../types/accuweather';

export class ApiError extends Error {
  constructor(
    public code: string,
    public statusCode: number,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }

  toResponse(): WeatherError {
    return {
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
    };
  }
}

export const ErrorCodes = {
  INVALID_CITY: 'INVALID_CITY',
  EMPTY_RESPONSE: 'EMPTY_RESPONSE',
  RATE_LIMITED: 'RATE_LIMITED',
  API_ERROR: 'API_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  SERVER_ERROR: 'SERVER_ERROR',
} as const;

export function createErrorResponse(error: unknown) {
  if (error instanceof ApiError) {
    return {
      statusCode: error.statusCode,
      body: error.toResponse(),
    };
  }

  if (error instanceof Error) {
    const apiError = new ApiError(
      ErrorCodes.SERVER_ERROR,
      500,
      'An unexpected error occurred'
    );
    return {
      statusCode: 500,
      body: apiError.toResponse(),
    };
  }

  const apiError = new ApiError(
    ErrorCodes.SERVER_ERROR,
    500,
    'Unknown error occurred'
  );
  return {
    statusCode: 500,
    body: apiError.toResponse(),
  };
}
