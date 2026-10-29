export type ApiResponse<T> = {
  statusCode: number;
  success: boolean;
  message: string;
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
  data: T;
};

function getApiUrl(path: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!baseUrl) throw new Error("API URL is not configured");

  const normalizedBaseUrl = baseUrl.replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (
    normalizedBaseUrl.endsWith("/api/v1") &&
    normalizedPath.startsWith("/api/v1/")
  ) {
    return `${normalizedBaseUrl}${normalizedPath.replace("/api/v1", "")}`;
  }

  return `${normalizedBaseUrl}${normalizedPath}`;
}

export async function getJson<TResponse>(
  path: string,
  accessToken?: string,
): Promise<ApiResponse<TResponse>> {
  const response = await fetch(getApiUrl(path), {
    method: "GET",
    headers: accessToken
      ? { Authorization: `Bearer ${accessToken}` }
      : undefined,
  });

  const result = (await response.json().catch(() => null)) as ApiResponse<TResponse> | null;

  if (!response.ok || !result?.success) {
    throw new Error(result?.message || "Unable to load data. Please try again.");
  }

  return result;
}

export async function postJson<TResponse, TBody extends object>(
  path: string,
  body: TBody,
  accessToken?: string,
): Promise<ApiResponse<TResponse>> {
  const response = await fetch(getApiUrl(path), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify(body),
  });

  const result = (await response.json().catch(() => null)) as ApiResponse<TResponse> | null;

  if (!response.ok || !result?.success) {
    throw new Error(result?.message || "Something went wrong. Please try again.");
  }

  return result;
}

export async function putJson<TResponse, TBody extends object>(
  path: string,
  body: TBody,
  accessToken?: string,
): Promise<ApiResponse<TResponse>> {
  const response = await fetch(getApiUrl(path), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify(body),
  });

  const result = (await response.json().catch(() => null)) as ApiResponse<TResponse> | null;

  if (!response.ok || !result?.success) {
    throw new Error(result?.message || "Unable to update data. Please try again.");
  }

  return result;
}

export async function putFormData<TResponse>(
  path: string,
  body: FormData,
  accessToken?: string,
): Promise<ApiResponse<TResponse>> {
  const response = await fetch(getApiUrl(path), {
    method: "PUT",
    headers: accessToken
      ? { Authorization: `Bearer ${accessToken}` }
      : undefined,
    body,
  });

  const result = (await response.json().catch(() => null)) as ApiResponse<TResponse> | null;

  if (!response.ok || !result?.success) {
    throw new Error(result?.message || "Unable to upload image. Please try again.");
  }

  return result;
}
