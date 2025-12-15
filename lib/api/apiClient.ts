/**
 * Custom fetch wrapper for Orval-generated API functions
 * Used server-side in Next.js API routes to call the Railway backend
 */

/**
 * Extended RequestInit with auth options for server-side calls
 */
export type CustomFetchOptions = RequestInit & {
  /**
   * Bearer token for authentication
   */
  token?: string;
  /**
   * Store ID for multi-tenancy
   */
  storeId?: string;
};

/**
 * Custom fetch function for Orval
 * This is the mutator that Orval will use for all generated API functions
 *
 * @param url - Full URL to fetch (built by Orval-generated getXxxUrl functions)
 * @param options - Standard RequestInit options plus custom auth options
 * @returns Promise with response containing data, status, and headers
 */
export const customFetch = async <T>(
  url: string,
  options?: CustomFetchOptions
): Promise<T> => {
  const { token, storeId, headers: optionHeaders, ...fetchOptions } = options || {};

  const headers: Record<string, string> = {
    ...(optionHeaders as Record<string, string>),
  };

  // Add auth token if provided
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Add store ID for multi-tenancy if provided
  if (storeId) {
    headers['X-Store-ID'] = storeId;
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  });

  const responseHeaders = response.headers;

  // Handle empty responses (204 No Content)
  if (response.status === 204) {
    return {
      data: undefined,
      status: response.status,
      headers: responseHeaders,
    } as T;
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    data = undefined;
  }

  return {
    data,
    status: response.status,
    headers: responseHeaders,
  } as T;
};

export default customFetch;
