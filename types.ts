
export enum TireStatus {
  NEW = 'NOVO',
  GOOD = 'MEIA_VIDA',
  WARNING = 'ATENCAO',
  CRITICAL = 'CRITICO'
}

export type PaymentMethod = 'VISTA' | 'CHEQUE' | 'PROMISSORIA' | 'PARCELADO' | 'CARTAO';

export interface MaintenanceRecord {
  id: string;
  date: string;
  type: 'FURO' | 'BOLHA' | 'DESGASTE_IRREGULAR' | 'RECAPAGEM' | 'RODIZIO' | 'OUTRO' | 'CORTE' | 'ESTOURO';
  description: string;
  cost: number;
}

export interface Tire {
  id: string; // "RG" do pneu (número de fogo)
  position: string; // ex: "Eixo 1 - Esquerdo"
  brand: string;
  model: string;
  dot: string; // Data de fabricação
  size: string;
  purchaseDate: string;
  purchasePrice: number;
  paymentMethod: PaymentMethod;
  storeName: string;
  initialKm: number;
  currentKm: number;
  status: TireStatus;
  treadDepth: number; // mm
  history: MaintenanceRecord[];
  cpk: number; // Custo por Km calculado
}

export interface Axle {
  id: string;
  type: 'DIANTEIRO' | 'TRAÇÃO' | 'TRUCK' | 'CARRETA';
  tires: (Tire | null)[]; // null represents empty slot
}

export interface Owner {
  name: string;
  driverName: string;
  photo?: string;
  city: string;
  street: string;
  number: string;
  phone: string;
  email?: string;
}

export interface Trip {
  id: string;
  origin: string;
  destination: string;
  distanceKm: number;
  startDate: string;
  plannedArrivalDate: string;
  completedDate?: string;
  status: 'ACTIVE' | 'COMPLETED';
}

export interface Truck {
  id: string;
  plate: string;
  model: string;
  axles: Axle[];
  spares: Tire[];
  totalKm: number;
  owner: Owner;
  activeTrip?: Trip | null;
  tripHistory: Trip[];
}

export type ViewState = 'GARAGE' | 'FINANCIAL' | 'AI_ADVISOR' | 'TRIP';

export const calculateTireStatus = (tire: Tire): TireStatus => {
  const kmRun = tire.currentKm - tire.initialKm;
  const hasStructuralDamage = tire.history.some(h => ['BOLHA', 'ESTOURO', 'CORTE'].includes(h.type));
  const retreadCount = tire.history.filter(h => h.type === 'RECAPAGEM').length;
  
  if (hasStructuralDamage) return TireStatus.CRITICAL;
  if (kmRun > 120000) return TireStatus.CRITICAL;
  if (retreadCount > 2) return TireStatus.CRITICAL;
  if (tire.treadDepth < 3) return TireStatus.CRITICAL;
  if (kmRun > 40000) return TireStatus.GOOD;
  if (retreadCount > 0) return TireStatus.GOOD;
  if (tire.treadDepth < 8) return TireStatus.GOOD;
  return TireStatus.NEW;
};