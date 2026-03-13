export interface MaintenanceSchedule {
  firstRevision: number;
  regularRevision: number;
  oilChange: number;
  airFilter?: number;
  sparkPlugs?: number;
  primaryOil?: number;
  belt?: number;
  cardanOil?: number;
  valves?: number;
}

export interface MotorcycleModel {
  name: string;
  category: string;
  schedule: MaintenanceSchedule;
  defaultCC?: number;
}

export const MOTORCYCLE_DATABASE: Record<string, MotorcycleModel[]> = {
  'Harley-Davidson': [
    {
      name: 'Softail (Fat Boy, Heritage)',
      category: 'Custom',
      schedule: { firstRevision: 1600, regularRevision: 8000, oilChange: 8000, primaryOil: 16000, belt: 8000 }
    },
    {
      name: 'Touring (Road/Street Glide)',
      category: 'Custom',
      schedule: { firstRevision: 1600, regularRevision: 8000, oilChange: 8000, primaryOil: 16000, belt: 8000 }
    },
    {
      name: 'Sportster S / Nightster',
      category: 'Custom',
      schedule: { firstRevision: 1600, regularRevision: 8000, oilChange: 8000 }
    },
    {
      name: 'Pan America 1250',
      category: 'Big Trail',
      schedule: { firstRevision: 1600, regularRevision: 8000, oilChange: 8000 }
    }
  ],
  'Kawasaki': [
    {
      name: 'Vulcan S 650',
      category: 'Custom',
      defaultCC: 650,
      schedule: { firstRevision: 1000, regularRevision: 12000, oilChange: 6000, airFilter: 18000, sparkPlugs: 12000 }
    },
    {
      name: 'Versys 650/1000',
      category: 'Big Trail',
      schedule: { firstRevision: 1000, regularRevision: 12000, oilChange: 6000, airFilter: 18000, sparkPlugs: 12000 }
    },
    {
      name: 'Z900 / Z1000',
      category: 'Naked',
      schedule: { firstRevision: 1000, regularRevision: 12000, oilChange: 6000, airFilter: 18000, sparkPlugs: 12000 }
    }
  ],
  'Suzuki': [
    {
      name: 'Boulevard M800',
      category: 'Custom',
      defaultCC: 800,
      schedule: { firstRevision: 1000, regularRevision: 6000, oilChange: 6000, airFilter: 12000, sparkPlugs: 12000 }
    },
    {
      name: 'V-Strom 650/1050',
      category: 'Big Trail',
      schedule: { firstRevision: 1000, regularRevision: 6000, oilChange: 6000, airFilter: 12000, sparkPlugs: 12000 }
    },
    {
      name: 'GSX-S750 / 1000',
      category: 'Naked',
      schedule: { firstRevision: 1000, regularRevision: 6000, oilChange: 6000, airFilter: 12000, sparkPlugs: 12000 }
    }
  ],
  'Honda': [
    {
      name: 'Shadow 750',
      category: 'Custom',
      defaultCC: 750,
      schedule: { firstRevision: 1000, regularRevision: 6000, oilChange: 6000, airFilter: 18000, sparkPlugs: 12000 }
    },
    {
      name: 'Africa Twin 1100',
      category: 'Big Trail',
      defaultCC: 1100,
      schedule: { firstRevision: 1000, regularRevision: 6000, oilChange: 6000, airFilter: 18000, sparkPlugs: 12000 }
    },
    {
      name: 'NC 750X',
      category: 'Big Trail',
      defaultCC: 750,
      schedule: { firstRevision: 1000, regularRevision: 10000, oilChange: 10000, airFilter: 20000, sparkPlugs: 48000 }
    },
    {
      name: 'CB 650R / 1000R',
      category: 'Naked',
      schedule: { firstRevision: 1000, regularRevision: 6000, oilChange: 6000, airFilter: 18000, sparkPlugs: 12000 }
    },
    {
      name: 'CG 160 / Bros 160',
      category: 'Urban',
      defaultCC: 160,
      schedule: { firstRevision: 1000, regularRevision: 6000, oilChange: 3000, airFilter: 18000, sparkPlugs: 12000 }
    },
    {
      name: 'CB 300F Twister',
      category: 'Urban',
      defaultCC: 300,
      schedule: { firstRevision: 1000, regularRevision: 6000, oilChange: 6000, airFilter: 18000, sparkPlugs: 12000 }
    }
  ],
  'Yamaha': [
    {
      name: 'Midnight Star 950',
      category: 'Custom',
      defaultCC: 950,
      schedule: { firstRevision: 1000, regularRevision: 5000, oilChange: 5000, airFilter: 15000, sparkPlugs: 10000 }
    },
    {
      name: 'MT-07 / MT-09',
      category: 'Naked',
      schedule: { firstRevision: 1000, regularRevision: 5000, oilChange: 5000, airFilter: 20000, sparkPlugs: 10000 }
    },
    {
      name: 'Factor / Fazer 150',
      category: 'Urban',
      defaultCC: 150,
      schedule: { firstRevision: 1000, regularRevision: 5000, oilChange: 5000, airFilter: 15000, sparkPlugs: 10000 }
    },
    {
      name: 'Fazer / Lander 250',
      category: 'Urban',
      defaultCC: 250,
      schedule: { firstRevision: 1000, regularRevision: 5000, oilChange: 5000, airFilter: 15000, sparkPlugs: 10000 }
    }
  ],
  'Royal Enfield': [
    {
      name: 'Meteor 350',
      category: 'Custom',
      defaultCC: 350,
      schedule: { firstRevision: 1000, regularRevision: 10000, oilChange: 10000, airFilter: 10000, sparkPlugs: 10000 }
    }
  ],
  'BMW': [
    {
      name: 'R 1250/1300 GS',
      category: 'Big Trail',
      defaultCC: 1250,
      schedule: { firstRevision: 1000, regularRevision: 10000, oilChange: 10000, airFilter: 20000, cardanOil: 20000 }
    },
    {
      name: 'F 850/900 GS',
      category: 'Big Trail',
      schedule: { firstRevision: 1000, regularRevision: 10000, oilChange: 10000, airFilter: 20000, sparkPlugs: 20000 }
    },
    {
      name: 'S 1000 RR',
      category: 'Sport',
      defaultCC: 1000,
      schedule: { firstRevision: 1000, regularRevision: 10000, oilChange: 10000, airFilter: 20000, sparkPlugs: 20000 }
    }
  ],
  'Triumph': [
    {
      name: 'Tiger 900',
      category: 'Big Trail',
      defaultCC: 900,
      schedule: { firstRevision: 1000, regularRevision: 10000, oilChange: 10000, airFilter: 20000, valves: 20000 }
    },
    {
      name: 'Tiger 1200',
      category: 'Big Trail',
      defaultCC: 1200,
      schedule: { firstRevision: 1000, regularRevision: 16000, oilChange: 16000, airFilter: 32000, cardanOil: 16000 }
    }
  ],
  'Ducati': [
    {
      name: 'Multistrada V4',
      category: 'Big Trail',
      defaultCC: 1100,
      schedule: { firstRevision: 1000, regularRevision: 15000, oilChange: 15000, airFilter: 30000, valves: 60000 }
    }
  ]
};

export const DEFAULT_SCHEDULE: MaintenanceSchedule = {
  firstRevision: 1000,
  regularRevision: 5000,
  oilChange: 3000,
  airFilter: 15000,
  sparkPlugs: 10000
};
