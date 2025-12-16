
export enum TireStatus {
  NEW = 'NOVO',
  GOOD = 'MEIA_VIDA',
  WARNING = 'ATENCAO',
  CRITICAL = 'CRITICO'
}

export interface MaintenanceRecord {
  id: string;
  date: string;
  type: 'FURO' | 'BOLHA' | 'DESGASTE_IRREGULAR' | 'RECAPAGEM' | 'RODIZIO' | 'PRESSAO' | 'OUTRO' | 'CORTE' | 'ESTOURO';
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
  initialKm: number;
  currentKm: number;
  status: TireStatus;
  pressure: number; // PSI
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
  name: string; // Nome da Empresa ou Proprietário
  driverName: string; // Nome do Condutor
  photo?: string; // Foto de perfil em Base64
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
  plannedArrivalDate: string; // Nova data de previsão de chegada
  completedDate?: string; // Data real de conclusão
  status: 'ACTIVE' | 'COMPLETED';
}

export interface Truck {
  id: string;
  plate: string;
  model: string;
  axles: Axle[];
  spares: Tire[]; // Pneus de estepe
  totalKm: number;
  owner: Owner;
  activeTrip?: Trip | null;
  tripHistory: Trip[]; // Histórico de viagens
}

export type ViewState = 'GARAGE' | 'FINANCIAL' | 'AI_ADVISOR' | 'TRIP';

/**
 * Calculates the status of a tire based on specific business rules:
 * - Critical: Structural damage, > 120k km, > 2 retreads, or < 3mm tread.
 * - Good (Meia Vida): > 40k km, 1-2 retreads, or < 8mm tread.
 * - New: Otherwise.
 */
export const calculateTireStatus = (tire: Tire): TireStatus => {
  const kmRun = tire.currentKm - tire.initialKm;
  
  // 1. Critical Checks (Priority)
  const hasStructuralDamage = tire.history.some(h => ['BOLHA', 'ESTOURO', 'CORTE'].includes(h.type));
  const retreadCount = tire.history.filter(h => h.type === 'RECAPAGEM').length;
  
  if (hasStructuralDamage) return TireStatus.CRITICAL;
  if (kmRun > 120000) return TireStatus.CRITICAL;
  if (retreadCount > 2) return TireStatus.CRITICAL;
  if (tire.treadDepth < 3) return TireStatus.CRITICAL;

  // 2. Warning/Good Checks
  if (kmRun > 40000) return TireStatus.GOOD;
  if (retreadCount > 0) return TireStatus.GOOD;
  if (tire.treadDepth < 8) return TireStatus.GOOD;

  // 3. Default New
  return TireStatus.NEW;
};