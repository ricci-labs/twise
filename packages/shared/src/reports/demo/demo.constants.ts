export const DEMO_SCENARIOS = ['current', 'overspent', 'closed', 'future'] as const

export type DemoScenario = (typeof DEMO_SCENARIOS)[number]

export const DEMO_VARIANTS = ['normal', 'overspent'] as const

export type DemoVariant = (typeof DEMO_VARIANTS)[number]

export const DEMO_WORKSPACE_IDS: Readonly<Record<DemoVariant, string>> = {
  normal: 'demo',
  overspent: 'demo-overspent',
}

export const DEMO_TODAY = '2026-10-20'

export const DEMO_WORKSPACE_NAME = 'Casa'

export const DEMO_ROLE_NAME = 'Dono'

export const DEMO_MEMBER_NAMES = ['Member A', 'Member B'] as const

export const DEMO_PERIOD_DAY = 5

export const DEMO_PERIOD_LABELS: Readonly<Record<DemoScenario, string>> = {
  current: '2026-10',
  overspent: '2026-10',
  closed: '2026-09',
  future: '2026-11',
}

export const DEMO_IDS = {
  checkingA: '00000000-0000-4000-8000-000000000101',
  checkingB: '00000000-0000-4000-8000-000000000102',
  reserve: '00000000-0000-4000-8000-000000000103',
  cardX: '00000000-0000-4000-8000-000000000104',
  cardY: '00000000-0000-4000-8000-000000000105',
  tripSavings: '00000000-0000-4000-8000-000000000106',
  laptopSavings: '00000000-0000-4000-8000-000000000107',
  salaryA: '00000000-0000-4000-8000-000000000201',
  salaryB: '00000000-0000-4000-8000-000000000202',
  commission: '00000000-0000-4000-8000-000000000203',
  groceries: '00000000-0000-4000-8000-000000000301',
  leisure: '00000000-0000-4000-8000-000000000302',
  transport: '00000000-0000-4000-8000-000000000303',
  home: '00000000-0000-4000-8000-000000000304',
  health: '00000000-0000-4000-8000-000000000305',
  rent: '00000000-0000-4000-8000-000000000306',
  bills: '00000000-0000-4000-8000-000000000307',
  electronics: '00000000-0000-4000-8000-000000000308',
  car: '00000000-0000-4000-8000-000000000309',
  other: '00000000-0000-4000-8000-000000000310',
  internet: '00000000-0000-4000-8000-000000000401',
  power: '00000000-0000-4000-8000-000000000402',
  condo: '00000000-0000-4000-8000-000000000403',
  gym: '00000000-0000-4000-8000-000000000404',
  cleaning: '00000000-0000-4000-8000-000000000405',
  healthPlan: '00000000-0000-4000-8000-000000000406',
  carInsurance: '00000000-0000-4000-8000-000000000407',
  streaming: '00000000-0000-4000-8000-000000000408',
  rentBill: '00000000-0000-4000-8000-000000000409',
  carTax: '00000000-0000-4000-8000-000000000410',
  salaryAPlan: '00000000-0000-4000-8000-000000000411',
  salaryBPlan: '00000000-0000-4000-8000-000000000412',
  water: '00000000-0000-4000-8000-000000000413',
  gas: '00000000-0000-4000-8000-000000000414',
  phone: '00000000-0000-4000-8000-000000000415',
  englishCourse: '00000000-0000-4000-8000-000000000416',
  homeInsurance: '00000000-0000-4000-8000-000000000417',
  contactC: '00000000-0000-4000-8000-000000000501',
  contactD: '00000000-0000-4000-8000-000000000502',
  contactE: '00000000-0000-4000-8000-000000000503',
  reserveGoal: '00000000-0000-4000-8000-000000000601',
  tripGoal: '00000000-0000-4000-8000-000000000602',
  laptopGoal: '00000000-0000-4000-8000-000000000603',
} as const

export const DEMO_NAMES: Readonly<Record<string, string>> = {
  [DEMO_IDS.checkingA]: 'Conta X',
  [DEMO_IDS.checkingB]: 'Conta Y',
  [DEMO_IDS.reserve]: 'Reserva de emergência',
  [DEMO_IDS.cardX]: 'Cartão X',
  [DEMO_IDS.cardY]: 'Cartão Y',
  [DEMO_IDS.tripSavings]: 'Poupança da viagem',
  [DEMO_IDS.laptopSavings]: 'Poupança do notebook',
  [DEMO_IDS.salaryA]: 'Salário A',
  [DEMO_IDS.salaryB]: 'Salário B',
  [DEMO_IDS.commission]: 'Comissão',
  [DEMO_IDS.groceries]: 'Mercado',
  [DEMO_IDS.leisure]: 'Lazer',
  [DEMO_IDS.transport]: 'Transporte',
  [DEMO_IDS.home]: 'Casa',
  [DEMO_IDS.health]: 'Saúde',
  [DEMO_IDS.rent]: 'Aluguel',
  [DEMO_IDS.bills]: 'Contas da casa',
  [DEMO_IDS.electronics]: 'Eletrônicos',
  [DEMO_IDS.car]: 'Carro',
  [DEMO_IDS.other]: 'Outros',
  [DEMO_IDS.internet]: 'Internet',
  [DEMO_IDS.power]: 'Energia',
  [DEMO_IDS.condo]: 'Condomínio',
  [DEMO_IDS.gym]: 'Academia',
  [DEMO_IDS.cleaning]: 'Faxina',
  [DEMO_IDS.healthPlan]: 'Plano de saúde',
  [DEMO_IDS.carInsurance]: 'Seguro do carro',
  [DEMO_IDS.streaming]: 'Streaming',
  [DEMO_IDS.rentBill]: 'Aluguel',
  [DEMO_IDS.carTax]: 'IPVA',
  [DEMO_IDS.salaryAPlan]: 'Salário A',
  [DEMO_IDS.salaryBPlan]: 'Salário B',
  [DEMO_IDS.water]: 'Água',
  [DEMO_IDS.gas]: 'Gás',
  [DEMO_IDS.phone]: 'Celular',
  [DEMO_IDS.englishCourse]: 'Curso de inglês',
  [DEMO_IDS.homeInsurance]: 'Seguro residencial',
  [DEMO_IDS.contactC]: 'Member C',
  [DEMO_IDS.contactD]: 'Member D',
  [DEMO_IDS.contactE]: 'Member E',
  [DEMO_IDS.reserveGoal]: 'Reserva de emergência',
  [DEMO_IDS.tripGoal]: 'Viagem',
  [DEMO_IDS.laptopGoal]: 'Notebook',
}

export const DEMO_ICONS: Readonly<Record<string, string>> = {
  [DEMO_IDS.checkingA]: 'wallet',
  [DEMO_IDS.checkingB]: 'wallet',
  [DEMO_IDS.reserve]: 'piggy-bank',
  [DEMO_IDS.cardX]: 'card',
  [DEMO_IDS.cardY]: 'card',
  [DEMO_IDS.tripSavings]: 'travel',
  [DEMO_IDS.laptopSavings]: 'piggy-bank',
  [DEMO_IDS.salaryA]: 'coin',
  [DEMO_IDS.salaryB]: 'coin',
  [DEMO_IDS.commission]: 'coin',
  [DEMO_IDS.groceries]: 'groceries',
  [DEMO_IDS.leisure]: 'leisure',
  [DEMO_IDS.transport]: 'transport',
  [DEMO_IDS.home]: 'house',
  [DEMO_IDS.health]: 'health',
  [DEMO_IDS.rent]: 'house',
  [DEMO_IDS.bills]: 'calendar',
  [DEMO_IDS.car]: 'transport',
}
