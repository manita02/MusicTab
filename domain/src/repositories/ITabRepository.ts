import { Tab } from "../entities/Tab";

export interface ITabRepository {
  save(tab: Tab): Promise<Tab>;
  findById(id: number): Promise<Tab | null>;
  findByUser(userId: number): Promise<Tab[]>;
  countByUserAndDate(userId: number, date: Date): Promise<number>;
  delete(id: number): Promise<void>;
}