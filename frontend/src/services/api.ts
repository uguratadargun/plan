import axios from "axios";
import { Person, Task, Week, ExportData } from "../types";
import { APP_CONFIG } from "../config";

export const isDev = APP_CONFIG.isDev;

const resolveApiUrl = () => {
  if (APP_CONFIG.customApiUrl) {
    return APP_CONFIG.customApiUrl;
  }

  return APP_CONFIG.isDev ? APP_CONFIG.devApiUrl : APP_CONFIG.prodApiUrl;
};

const API_URL = resolveApiUrl();

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Persons API
export const personsApi = {
  getAll: async (): Promise<Person[]> => {
    const response = await api.get<Person[]>("/persons");
    return response.data;
  },

  create: async (person: Omit<Person, "id">): Promise<Person> => {
    const response = await api.post<Person>("/persons", person);
    return response.data;
  },

  update: async (id: string, person: Partial<Person>): Promise<Person> => {
    const response = await api.put<Person>(`/persons/${id}`, person);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/persons/${id}`);
  },

  reorder: async (personIds: string[]): Promise<Person[]> => {
    const response = await api.post<Person[]>("/persons/reorder", {
      personIds,
    });
    return response.data;
  },
};

// Tasks API
export const tasksApi = {
  getAll: async (params?: {
    personId?: string;
    weekStart?: string;
  }): Promise<Task[]> => {
    const response = await api.get<Task[]>("/tasks", { params });
    return response.data;
  },

  create: async (task: Omit<Task, "id">): Promise<Task> => {
    const response = await api.post<Task>("/tasks", task);
    return response.data;
  },

  update: async (id: string, task: Partial<Task>): Promise<Task> => {
    const response = await api.put<Task>(`/tasks/${id}`, task);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/tasks/${id}`);
  },
};

// Weeks API
export const weeksApi = {
  getAll: async (): Promise<Week[]> => {
    const response = await api.get<Week[]>("/weeks");
    return response.data;
  },
};

// Data import/export API
export const dataApi = {
  export: async (): Promise<Blob> => {
    const response = await api.get<Blob>("/data/export", { responseType: "blob" });
    return response.data;
  },

  import: async (payload: ExportData): Promise<ExportData> => {
    const response = await api.post<ExportData>("/data/import", payload);
    return response.data;
  },
};
