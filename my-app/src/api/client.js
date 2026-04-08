import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
});

function authHeaders(token) {
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
}

function normalizeError(error) {
  const message =
    error.response?.data?.message || error.message || "Something went wrong.";
  const normalizedError = new Error(message);
  normalizedError.status = error.response?.status;
  throw normalizedError;
}

export async function registerUser(payload) {
  try {
    const { data } = await apiClient.post("/auth/register", payload);
    return data;
  } catch (error) {
    normalizeError(error);
  }
}

export async function loginUser(payload) {
  try {
    const { data } = await apiClient.post("/auth/login", payload);
    return data;
  } catch (error) {
    normalizeError(error);
  }
}

export async function logoutUser(token) {
  try {
    const { data } = await apiClient.post("/auth/logout", {}, authHeaders(token));
    return data;
  } catch (error) {
    normalizeError(error);
  }
}

export async function fetchCurrentUser(token) {
  try {
    const { data } = await apiClient.get("/auth/me", authHeaders(token));
    return data;
  } catch (error) {
    normalizeError(error);
  }
}

export async function fetchLinks(token) {
  try {
    const { data } = await apiClient.get("/links", authHeaders(token));
    return data;
  } catch (error) {
    normalizeError(error);
  }
}

export async function createLink(token, payload) {
  try {
    const { data } = await apiClient.post("/links", payload, authHeaders(token));
    return data;
  } catch (error) {
    normalizeError(error);
  }
}

export async function toggleLinkStatus(token, linkId) {
  try {
    const { data } = await apiClient.patch(
      `/links/${linkId}/toggle`,
      {},
      authHeaders(token),
    );
    return data;
  } catch (error) {
    normalizeError(error);
  }
}

export async function deleteLink(token, linkId) {
  try {
    const { data } = await apiClient.delete(`/links/${linkId}`, authHeaders(token));
    return data;
  } catch (error) {
    normalizeError(error);
  }
}
