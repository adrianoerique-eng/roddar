import { Truck, TireStatus, Axle } from './types';

// Helper to create a mock tire
export const createTire = (id: string, brand: string, status: TireStatus, price: number, km: number): any => ({
  id,
  brand,
  model: 'X Multi Z',
  dot: '2323',
  size: '295/80R22.5',
  purchaseDate: '2023-01-15',
  purchasePrice: price,
  initialKm: 0,
  currentKm: km,
  status,
  pressure: 110,
  treadDepth: status === TireStatus.NEW ? 18 : (status === TireStatus.GOOD ? 10 : 3),
  cpk: price / (km || 1), // Simplified CPK
  history: []
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
    photo: '', // Empty by default
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
        createTire('FIRE-001', 'Michelin', TireStatus.GOOD, 2800, 45000),
        createTire('FIRE-002', 'Michelin', TireStatus.GOOD, 2800, 45000)
      ]
    },
    {
      id: 'axle-2',
      type: 'TRAÇÃO',
      tires: [
        createTire('FIRE-003', 'Bridgestone', TireStatus.NEW, 2400, 5000),
        createTire('FIRE-004', 'Bridgestone', TireStatus.NEW, 2400, 5000),
        createTire('FIRE-005', 'Bridgestone', TireStatus.NEW, 2400, 5000),
        createTire('FIRE-006', 'Bridgestone', TireStatus.NEW, 2400, 5000)
      ]
    }
  ],
  spares: [
     createTire('STP-001', 'Goodyear', TireStatus.GOOD, 2200, 1000)
  ]
};