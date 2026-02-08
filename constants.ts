import { Policy } from './types';

export const INITIAL_POLICIES: Policy[] = [
  {
    id: '1',
    nombre: "María Fernanda López Ruiz",
    telefono: "3312456789",
    poliza: "70123456",
    ramo: "Vida",
    producto: "PPR",
    vigencia: "2026-01-15"
  },
  {
    id: '2',
    nombre: "Laura Beatriz Dominguez",
    telefono: "3312233445",
    poliza: "80134501",
    ramo: "Gastos Médicos",
    producto: "GMM",
    vigencia: "2026-01-10"
  },
  {
    id: '3',
    nombre: "Juan Pablo Méndez",
    telefono: "3313334455",
    poliza: "90145601",
    ramo: "Auto",
    producto: "Amplia",
    vigencia: "2026-01-12"
  },
  {
    id: '4',
    nombre: "Carlos Alberto Hernández Soto",
    telefono: "3318765432",
    poliza: "70123457",
    ramo: "Vida",
    producto: "PPR",
    vigencia: "2026-02-20"
  },
  {
    id: '5',
    nombre: "Raúl Esteban Muñoz",
    telefono: "3323344556",
    poliza: "80134502",
    ramo: "Gastos Médicos",
    producto: "GMM",
    vigencia: "2026-02-25"
  },
  {
    id: '6',
    nombre: "Víctor Hugo Chávez",
    telefono: "3335556677",
    poliza: "90145603",
    ramo: "Auto",
    producto: "Limitada",
    vigencia: "2025-11-09" 
  }
];

export const RAMO_COLORS = {
  'Vida': '#3b82f6', // blue-500
  'Gastos Médicos': '#10b981', // emerald-500
  'Auto': '#f59e0b', // amber-500
};

export const RAMO_OPTIONS = ['Vida', 'Gastos Médicos', 'Auto'];