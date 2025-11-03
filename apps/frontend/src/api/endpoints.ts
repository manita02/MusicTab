export const ENDPOINTS = {
  users: {
    login: "/users/login",
    register: "/users/register",
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