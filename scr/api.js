
import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_SUPABASE_URL}/rest/v1`,
  headers: {
    apikey: import.meta.env.VITE_SUPABASE_KEY,
    Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_KEY}`,
    "Content-Type": "application/json"
  }
});

export const getBooks = () =>
  api.get("/books?select=*&order=id");

export const addBook = (book) =>
  api.post("/books", book);

export const updateBook = (id, data) =>
  api.patch(`/books?id=eq.${id}`, data);

export const deleteBook = (id) =>
  api.delete(`/books?id=eq.${id}`);

export const getStudents = () =>
  api.get("/students?select=*&order=id");

export const addStudent = (student) =>
  api.post("/students", student);

export const getTransactions = () =>
  api.get("/transactions?select=*&order=id.desc");

export const addTransaction = (transaction) =>
  api.post("/transactions", transaction);

export const updateTransaction = (id, data) =>
  api.patch(`/transactions?id=eq.${id}`, data);
