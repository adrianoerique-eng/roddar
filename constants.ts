import { Truck, TireStatus, Axle, Tire } from './types';

// Helper to create a mock tire
export const createTire = (id: string, brand: string, status: TireStatus, price: number, km: number): Tire => ({
  id,
  brand,
  model: 'X Multi Z',
  dot: '2323',
  size: '295/80R22.5',
  purchaseDate: '2024-01-10',
  purchasePrice: price,
  paymentMethod: 'VISTA',
  storeName: 'Pneus e Cia Tabuleiro',
  initialKm: 0,
  currentKm: km,
  status,
  treadDepth: status === TireStatus.NEW ? 18 : (status === TireStatus.GOOD ? 10 : 3),
  cpk: price / (km || 1),
  history: [],
  position: ''
});

export const MOCK_TRUCK: Truck = {
  id: 'truck-01',
  plate: 'HUE-2024',
  model: 'Volvo FH 540',
  totalKm: 124500,
  owner: {
    name: 'Transportadora Modelo',
    driverName: 'João da Silva',
    city: 'Tabuleiro do Norte - CE',
    photo: '',
    street: 'Rodovia BR-116',
    number: 'KM 200',
    phone: '(88) 99999-0000',
    email: 'contato@modelo.com'
  },
  tripHistory: [],
  axles: [
    {
      id: 'axle-1',
      type: 'DIANTEIRO',
      tires: [
        createTire('MIC-001', 'Michelin', TireStatus.GOOD, 3200, 45000),
        createTire('MIC-002', 'Michelin', TireStatus.GOOD, 3200, 45000)
      ]
    },
    {
      id: 'axle-2',
      type: 'TRAÇÃO',
      tires: [
        createTire('BRI-003', 'Bridgestone', TireStatus.NEW, 2850, 5000),
        createTire('BRI-004', 'Bridgestone', TireStatus.NEW, 2850, 5000),
        createTire('BRI-005', 'Bridgestone', TireStatus.NEW, 2850, 5000),
        createTire('BRI-006', 'Bridgestone', TireStatus.NEW, 2850, 5000)
      ]
    }
  ],
  spares: [
     createTire('STP-001', 'Goodyear', TireStatus.GOOD, 2400, 1000)
  ]
};