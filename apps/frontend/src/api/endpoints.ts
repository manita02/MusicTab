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
    public: "/tabs/public",
    latestPublic: "/tabs/latest/public",
    list: "/tabs",
    latest: "/tabs/latest",
    download: (id: number | string) => `/tabs/${id}/download`,
    create: "/tabs",
    legacyCreate: "/tabs/create",
    update: (id: number | string) => `/tabs/${id}`,
    legacyUpdate: (id: number | string) => `/tabs/update/${id}`,
    delete: (id: number) => `/tabs/${id}`,
  },
};