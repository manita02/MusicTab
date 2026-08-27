export const ENDPOINTS = {
  users: {
    login: "/users/login",
    register: "/users/register",
    list: "/users",
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
    view: (id: number | string) => `/tabs/${id}/view`,
    create: "/tabs",
    legacyCreate: "/tabs/create",
    update: (id: number | string) => `/tabs/${id}`,
    legacyUpdate: (id: number | string) => `/tabs/update/${id}`,
    delete: (id: number) => `/tabs/${id}`,
  },
  copilot: {
    chat: "/copilot/chat",
    quota: "/copilot/quota",
  },
  stats: {
    global: "/stats/global",
    me: "/stats/me",
  },
  backup: {
    download: "/admin/backup.sql",
  },
};