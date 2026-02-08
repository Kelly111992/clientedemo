export type RamoType = 'Vida' | 'Gastos Médicos' | 'Auto';

export interface Policy {
  id: string;
  nombre: string;
  telefono: string;
  poliza: string;
  ramo: RamoType;
  producto: string;
  vigencia: string; // ISO Date string YYYY-MM-DD
}

export interface StatsData {
  totalPolicies: number;
  expiringSoon: number;
  byRamo: { name: string; value: number; color: string }[];
}