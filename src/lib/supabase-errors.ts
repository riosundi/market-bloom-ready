/**
 * Utility to map common Supabase and network errors to user-friendly messages.
 * This ensures that users see helpful context instead of technical codes or "[object Object]".
 */

export interface SupabaseError {
  code?: string;
  message: string;
  details?: string;
  hint?: string;
}

export function getFriendlyErrorMessage(error: any): string {
  if (!error) return "An unexpected error occurred.";

  // Handle standard Error objects
  if (error instanceof Error) {
    // Check for network errors
    if (error.message.includes("fetch") || error.message.includes("NetworkError") || error.message.includes("Failed to fetch")) {
      return "Unable to connect to the marketplace. Please check your internet connection.";
    }
    
    // If it's a Supabase error wrapped in an Error object, it might have a code
    const sbError = error as any;
    if (sbError.code) {
      return mapSupabaseCodeToMessage(sbError.code, sbError.message);
    }

    return error.message;
  }

  // Handle string errors
  if (typeof error === "string") {
    return error;
  }

  // Handle Supabase error objects directly
  if (error.code) {
    return mapSupabaseCodeToMessage(error.code, error.message);
  }

  // Handle generic objects with message/statusText
  return error.message || error.statusText || "Something went wrong. Please try again.";
}

function mapSupabaseCodeToMessage(code: string, originalMessage?: string): string {
  switch (code) {
    // PostgreSQL Error Codes (common in Supabase)
    case "42501": // insufficient_privilege
      return "You don't have permission to view this information. If you think this is a mistake, please contact support.";
    case "23505": // unique_violation
      return "This record already exists. Please check your entries.";
    case "23503": // foreign_key_violation
      return "This operation cannot be completed because this record is linked to other information.";
    case "PGRST116": // multiple_rows_found (when .single() is used)
      return "Unexpected data found. Please refresh and try again.";
    
    // Supabase Auth Codes
    case "invalid_credentials":
      return "Invalid email or password. Please try again.";
    case "email_not_confirmed":
      return "Please check your email and confirm your account before logging in.";
    case "user_not_found":
      return "We couldn't find an account with those details.";
    case "over_rate_limit":
      return "Too many attempts. Please wait a few minutes and try again.";
    
    // Fallback
    default:
      // If we have a readable message from Supabase, use it, otherwise generic
      if (originalMessage && originalMessage.length < 100 && !originalMessage.includes("permission denied")) {
        return originalMessage;
      }
      return "A database error occurred. Please refresh the page.";
  }
}
