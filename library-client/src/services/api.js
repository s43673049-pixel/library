import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function getBooks() {
  return api.get("/books");
}

export function addBook(payload) {
  return api.post("/books", payload);
}

export function deleteBook(id) {
  return api.delete(`/books/${id}`);
}

export function signup({ name, email, password }) {
  return api.post("/auth/signup", { name, email, password });
}

export function login({ email, password }) {
  return api.post("/auth/login", { email, password });
}

export function getMe() {
  return api.get("/auth/me");
}

export function getMembers() {
  return api.get("/members");
}

export function addMember({ name, email, phone }) {
  return api.post("/members", { name, email, phone });
}

export function getTransactions(active) {
  return api.get(`/transactions${active === undefined ? "" : `?active=${active}`}`);
}

export function issueBook({ memberId, bookId, dueDate }) {
  return api.post("/transactions/issue", { memberId, bookId, dueDate });
}

export function returnBook({ transactionId }) {
  return api.post("/transactions/return", { transactionId });
}

