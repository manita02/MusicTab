export const ENDPOINTS = {
  users: {
    login: "/users/login",
    register: "/users/register",
    update: (id: number | string) => `/users/${id}`,
    delete: (id: number | string) => `/users/${id}`,
  },
  catalogs: {
    genres: "/catalogs/genres",
    instruments: "/catalogs/instruments",
  },
  tabs: {
    create: "/tabs/create",
    latest: "/tabs/latest",
    all: "/tabs/all",
    update: (id: number | string) => `/tabs/update/${id}`,
    delete: (id: number) => `/tabs/${id}`,
  },
};