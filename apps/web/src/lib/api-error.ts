import { AxiosError } from 'axios';

export interface ParsedApiError {
  statusCode: number;
  message: string;
  fieldErrors?: Record<string, string>;
  isNetworkError: boolean;
  isAuthError: boolean;
  isNotFoundError: boolean;
  isConflictError: boolean;
}

/**
 * Maps raw HTTP errors or Axios errors to clean, human-readable user messages
 */
export function parseApiError(error: unknown): ParsedApiError {
  // Check if offline or no network connection
  if (typeof window !== 'undefined' && !navigator.onLine) {
    return {
      statusCode: 0,
      message: 'Network offline. Please check your internet connection and try again.',
      isNetworkError: true,
      isAuthError: false,
      isNotFoundError: false,
      isConflictError: false,
    };
  }

  // Axios Error handling
  if (error && typeof error === 'object' && 'isAxiosError' in error) {
    const axiosErr = error as AxiosError<{
      success?: boolean;
      message?: string | string[];
      error?: {
        statusCode?: number;
        error?: string;
        details?: any;
      };
    }>;

    if (!axiosErr.response) {
      // Network disconnect, timeout, or DNS failure
      return {
        statusCode: 0,
        message: 'Unable to reach the Brightloop server. Please check your network connection.',
        isNetworkError: true,
        isAuthError: false,
        isNotFoundError: false,
        isConflictError: false,
      };
    }

    const status = axiosErr.response.status;
    const data = axiosErr.response.data;

    let serverMessage = '';
    if (typeof data?.message === 'string') {
      serverMessage = data.message;
    } else if (Array.isArray(data?.message) && data.message.length > 0) {
      serverMessage = data.message[0];
    }

    // Extract field-level validation errors if present in details
    let fieldErrors: Record<string, string> | undefined;
    if (Array.isArray(data?.error?.details)) {
      fieldErrors = {};
      data.error.details.forEach((item: any) => {
        if (item?.path && item?.message) {
          fieldErrors![item.path] = item.message;
        } else if (typeof item === 'string') {
          // e.g. "email must be an email"
          const parts = item.split(' ');
          if (parts[0]) {
            fieldErrors![parts[0]] = item;
          }
        }
      });
    }

    // Friendly fallback based on HTTP status code
    let userMessage = serverMessage;
    switch (status) {
      case 400:
        if (!userMessage) {
          userMessage = 'The submitted information was incomplete or invalid. Please check the fields and try again.';
        }
        break;
      case 401:
        userMessage = userMessage || 'Your session has expired. Please log in again to continue.';
        break;
      case 403:
        userMessage = userMessage || 'You do not have administrative permission to perform this action.';
        break;
      case 404:
        userMessage = userMessage || 'The requested resource was not found. It may have been relocated or removed.';
        break;
      case 409:
        userMessage = userMessage || 'A record with this information already exists in your workspace.';
        break;
      case 422:
        userMessage = userMessage || 'Validation failed. Please verify that all inputs satisfy required formats.';
        break;
      case 429:
        userMessage = 'Too many requests were received. Please wait a moment before trying again.';
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        userMessage = 'Our service engine encountered a temporary problem. Our team has been notified.';
        break;
      default:
        if (!userMessage) {
          userMessage = 'An unexpected error occurred while completing this request.';
        }
    }

    return {
      statusCode: status,
      message: userMessage,
      fieldErrors,
      isNetworkError: false,
      isAuthError: status === 401,
      isNotFoundError: status === 404,
      isConflictError: status === 409,
    };
  }

  // Standard JS Error
  if (error instanceof Error) {
    return {
      statusCode: 500,
      message: error.message || 'An unexpected client-side error occurred.',
      isNetworkError: false,
      isAuthError: false,
      isNotFoundError: false,
      isConflictError: false,
    };
  }

  return {
    statusCode: 500,
    message: 'An unknown error occurred. Please try again later.',
    isNetworkError: false,
    isAuthError: false,
    isNotFoundError: false,
    isConflictError: false,
  };
}
