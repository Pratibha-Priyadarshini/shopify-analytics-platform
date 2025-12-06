const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token");
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Request failed" }));
    const errorMessage = error.error || error.message || `Request failed with status ${response.status}`;
    console.error("API Error:", { status: response.status, error: errorMessage, endpoint });
    throw new ApiError(response.status, errorMessage);
  }

  return response.json();
}

// Auth APIs
export const authApi = {
  signup: (email: string, password: string, name?: string) =>
    fetchApi("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    }),

  login: (email: string, password: string) =>
    fetchApi("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
};

// Tenant APIs
export const tenantApi = {
  getAll: () => fetchApi("/tenants"),

  getById: (tenantId: string) => fetchApi(`/tenants/${tenantId}`),

  create: (data: { name: string; shopifyDomain: string; accessToken: string }) =>
    fetchApi("/tenants", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  sync: (tenantId: string) =>
    fetchApi(`/tenants/${tenantId}/sync`, {
      method: "POST",
    }),

  delete: (tenantId: string) =>
    fetchApi(`/tenants/${tenantId}`, {
      method: "DELETE",
    }),
};

// Insights APIs
export const insightsApi = {
  getSummary: (tenantId: string) => fetchApi(`/insights/${tenantId}/summary`),

  getOrdersByDate: (tenantId: string, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    const query = params.toString() ? `?${params.toString()}` : "";
    return fetchApi(`/insights/${tenantId}/orders-by-date${query}`);
  },

  getTopCustomers: (tenantId: string, limit = 5) =>
    fetchApi(`/insights/${tenantId}/top-customers?limit=${limit}`),

  getRevenueTrend: (tenantId: string, days = 30) =>
    fetchApi(`/insights/${tenantId}/revenue-trend?days=${days}`),

  getCustomerGrowth: (tenantId: string, days = 30) =>
    fetchApi(`/insights/${tenantId}/customer-growth?days=${days}`),

  getProductPerformance: (tenantId: string) =>
    fetchApi(`/insights/${tenantId}/product-performance`),
};

// Orders APIs
export const ordersApi = {
  getAll: (tenantId: string, params?: { status?: string; startDate?: string; endDate?: string; limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append("status", params.status);
    if (params?.startDate) queryParams.append("startDate", params.startDate);
    if (params?.endDate) queryParams.append("endDate", params.endDate);
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    const query = queryParams.toString() ? `?${queryParams.toString()}` : "";
    return fetchApi(`/orders/${tenantId}${query}`);
  },

  getById: (tenantId: string, orderId: string) =>
    fetchApi(`/orders/${tenantId}/${orderId}`),

  getStats: (tenantId: string, days = 30) =>
    fetchApi(`/orders/${tenantId}/stats/summary?days=${days}`),
};

// Customers APIs
export const customersApi = {
  getAll: (tenantId: string) => fetchApi(`/customers/${tenantId}`),

  getById: (tenantId: string, customerId: string) =>
    fetchApi(`/customers/${tenantId}/${customerId}`),
};

// Products APIs
export const productsApi = {
  getAll: (tenantId: string, params?: { category?: string; status?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append("category", params.category);
    if (params?.status) queryParams.append("status", params.status);
    const query = queryParams.toString() ? `?${queryParams.toString()}` : "";
    return fetchApi(`/products/${tenantId}${query}`);
  },

  getById: (tenantId: string, productId: string) =>
    fetchApi(`/products/${tenantId}/${productId}`),

  getStats: (tenantId: string) =>
    fetchApi(`/products/${tenantId}/stats/summary`),
};
