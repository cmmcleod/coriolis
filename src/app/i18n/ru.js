export const formats = {
  decimal: ',',
  thousands: '\xa0',
  grouping: [3],
  currency: ['', ' руб.'],
  dateTime: '%A, %e %B %Y г. %X',
  date: '%d.%m.%Y',
  time: '%H:%M:%S',
  periods: ['AM', 'PM'],
  days: ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'],
  shortDays: ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'],
  months: ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'],
  shortMonths: ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']
};

export const terms = {
  // Phrases
  PHRASE_BACKUP_DESC: 'Сохраните все данные перед переносом в другой браузер или устройство', // Backup of all Coriolis data to save or transfer to another browser/device
  PHRASE_CONFIRMATION: 'Вы уверены?', // Are You Sure?
  PHRASE_EXPORT_DESC: 'Детальный JSON-экспорт вашей сборки для использования в других местах и инструментах', // A detailed JSON export of your build for use in other sites and tools
  PHRASE_FASTEST_RANGE: null, // Consecutive max range jumps
  PHRASE_IMPORT: 'Для импорта вставьте код в эту форму',  // Paste JSON or import here
  PHRASE_LADEN: null, // Ship Mass + Fuel + Cargo
  PHRASE_NO_BUILDS: 'Нечего сравнивать',  // No builds added to comparison!
  PHRASE_NO_RETROCH: 'нет ранних версий сборкиконфигурации',  // No Retrofitting changes
  PHRASE_SELECT_BUILDS: 'Выберите конфигурацию для сравнения',  // Select Builds to Compare
  PHRASE_SG_RECHARGE: null, // Time from 50% to 100% Charge
  PHRASE_SG_RECOVER: null,  // Recovery (to 50%) after collapse
  PHRASE_UNLADEN: null, // Ship Mass excluding Fuel and Cargo
  PHRASE_UPDATE_RDY: 'Доступно обновление. Нажмите для обновления.',  // Update Available! Click to Refresh

  // Modules / Module Types - These should match the in-game translation (if any)
  'Advanced Discovery Scanner': null, // Advanced Discovery Scanner
  'Basic Discovery Scanner': 'Стандартный исследовательский сканер',  // Basic Discovery Scanner
  'Cargo Hatch': 'Грузовой люк',  // Cargo Hatch
  'Chaff Launcher': 'Постановщик помех',  // Chaff Launcher
  'Detailed Surface Scanner': 'Подробный сканер поверхности', // Detailed Surface Scanner
  'Electronic Countermeasure': 'Электронная противомера', // Electronic Countermeasure
  'Heat Sink Launcher': 'Теплоотводная ПУ', // Heat Sink Launcher
  'Intermediate Discovery Scanner': 'Средний исследовательский сканер', // Intermediate Discovery Scanner
  'Point Defence': 'Противоракетная защита',
  'Standard Docking Computer': 'Стандартный стыковочный компьютер', // Standard Docking Computer
  am: 'Ремонтный модуль', // Auto Field-Maintenance Unit
  bh: 'Корпус', // Bulkheads
  bl: 'Лучевой лазер',  // Beam Laser
  bsg: null,  // Bi-Weave Shield Generator
  c: 'Пушка', // Cannon
  cc: 'Контроллер "дрон-сборщик"',  // Collector Limpet Controller
  cm: 'Контрмеры',  // Countermeasure
  cr: 'Грузовой отсек', // Cargo Rack
  cs: 'Сканер груза', // Cargo Scanner
  dc: 'Стыковочный компьютер',  // Docking Computer
  fc: 'Осколочное Орудие',  // Fragment Cannon
  fi: 'Перехватчик FSD',  // FSD Interdictor
  fs: 'Топливосборщик', // Fuel Scoop
  fsd: 'Двигатель FSD', // Frame Shift Drive
  ft: 'Топливный бак',  // Fuel Tank
  fx: 'Контроллер "Дрон-заправщик"',  // Fuel Transfer Limpet Controller
  hb: 'Контроллер "дрон-взломщик"', // Hatch Breaker Limpet Controller
  hr: 'Набор усиления корпуса', // Hull Reinforcement Package
  kw: 'Полицейский сканер', // Kill Warrant Scanner
  ls: 'Система жизнеобеспечения', // life support
  mc: 'Многоствольное орудие',  // Multi-cannon
  ml: 'Бурильный лазер',  // Mining Laser
  mr: 'Ракетная установка', // Missile Rack
  nl: 'Минноукладчик',  // Mine Launcher
  pa: 'Ускоритель плазмы',  // Plasma Accelerator
  pas: null,  // Planetary Approach Suite
  pc: 'Контроллер "Дрон-исследователь"',  // Prospector Limpet Controller
  pd: 'Распределитель энергии', // power distributor
  pl: 'Импульсный лазер', // Pulse Laser
  pp: 'Реактор',  // Power Plant
  psg: 'Генератор призматического щита',  // Prismatic Shield Generator
  pv: null, // Planetary Vehicle Hanger
  rf: 'Переработка',  // Refinery
  rg: 'Рельсотрон', // Rail Gun
  s: 'Сенсоры', // Sensors
  sb: 'Усилитель щита', // Shield Booster
  sc: 'Сканер', // Scanner
  scb: 'Батареи перезарядки щита',  // Shield Cell Bank
  sg: 'Генератор щита', // Shield Generator
  t: 'Двигатели', // Thrusters
  tp: 'Торпедный аппарат',  // Torpedo Pylon
  ul: 'Мультиимпульсный лазер', // Burst Laser
  ws: 'FSD Сканнер',  // Frame Shift Wake Scanner

  // Bulkheads - These should match the in-game translation (if any)
  'Lightweight Alloy': 'Легкий сплав',
  'Reinforced Alloy': 'Усиленный сплав',
  'Military Grade Composite': 'Военный композит',
  'Mirrored Surface Composite': 'Зеркальный композит',
  'Reactive Surface Composite': 'Динамическая защита',

  // Units / Metrics
  '/min': null, // Per minute
  '/s': null, // Per second
  kg: null, // Kilogram
  'kg/s': null, // Kilograms per second
  km: null, // Kilometer
  'm/s': 'м/с', // Meters / Second
  Ls: 'Св.сек', // Light seconds
  LY: 'Св.лет', // Light Years
  MJ: null, // Mega Joules
  MW: null, // Mega Watts
  CR: 'кр.',  // Credits abbreviation

  // Sizes
  S: 'M', // Small Hardpoint (single Character)
  M: 'С', // Medium Hardpoint size (single character)
  L: 'б', // Large Hardpoint size (single character)
  H: 'O', // Huge Hardpoint size (single character)
  U: 'B', // Utility Hardpoint size (single character) - Kill warrant scanner, etc

  // Insurance
  alpha: 'Альфа', // Alpha backer insurance level
  beta: 'Бета', // Beta back insurance level
  standard: 'Стандартный',  // Standard insurance level

  // Terms
  'build name': 'название сборки',  // Ship build/configuration/design name
  'compare all': 'сравнить все',
  'create new': 'Создать новый',
  'damage per second': null,
  'delete all': 'Удалить все',
  'detailed export': 'Подробный экспорт',
  'edit data': 'Редактирование',
  'empty all': null,
  'Enter Name': 'Введите имя',
  'fastest range': null,  // Fastet totaljump range - sum of succesive jumps
  'fuel level': null, // Percent of fuel (T) in the tank
  'full tank': 'Полный бак',
  'internal compartments': 'внутренние отсеки',
  'jump range': 'Дальность прыжка',
  'mass lock factor': 'Масс. блок',
  'max mass': 'Максимальная масса',
  'net cost': 'разница в цене',
  'none created': 'не создано',
  'optimal mass': null, // Lowest weight / best weight for jump distance, etc
  'refuel time': 'Время дозаправки',  // Time to refuel the tank when scooping
  'reload costs': null,
  'retrofit costs': 'цена модификации', // The cost difference when upgrading / downgrading a component
  'retrofit from': 'модификация от',  // Retrofit from Build A against build B
  'T-Load': 'Тепл.',  // Thermal load abbreviation
  'total range': null,
  'unit cost': null,
  'utility mounts': 'Вспомогательное оборудование',
  about: 'О ...', // Link to about page / about Coriolis.io
  action: 'Действие',
  added: 'Добавлено',
  ammo: 'Боекомплект',  // Ammunition
  armour: 'Броня',
  available: 'доступно',
  backup: 'Резервная копия',
  base: null,
  bays: null,
  bins: 'контейнеры', // Number of Mining Refinery bins
  boost: 'форсаж',
  build: 'cборка',  // Shorthand for the build/configuration/design name
  builds: 'cборки', // Ship build/configuration/design names
  buy: 'купить',
  cancel: 'отменить',
  cargo: 'Груз',
  cells: 'Ячейки',  // Number of cells in a shield cell bank
  close: 'закрыть',
  compare: 'сравнить ',
  comparison: 'сравнение',
  comparisons: 'сравнения',
  cost: 'Стоимость',  // Cost / price of a module or price of a ship
  costs: 'Расходы', // Costs / prices of a modules or prices of ships
  create: 'создать',
  credits: 'Кредиты',
  damage: 'Урон',
  delete: 'Удалить',
  dep: 'Вып', // Weapons/Hardpoints Deployed abbreviation
  deployed: 'Открыты',  // Weapons/Hardpoints Deployed
  disabled: 'Отключено',
  discount: 'Скидка',
  DPS: 'УВС', // Damage per second abbreviation
  efficiency: 'Эффективность',  // Power Plant efficiency
  empty: 'пусто',
  ENG: 'ДВГ', // Abbreviation - Engine recharge rate for power distributor
  Explorer: null,
  export: 'Экспорт',
  forum: 'Форум',
  fuel: 'Топливо',
  hardpoints: 'Орудийные порты',
  hull: 'Корпус', // Ships hull
  import: 'импортировать ',
  insurance: 'Страховка',
  jump: null, // Single jump range
  jumps: 'Прыжков',
  laden: 'Груженый',
  language: 'Язык',
  maneuverability: 'Моневренность',
  manufacturer: null,
  mass: 'Масса',
  max: 'Макс',
  MLF: null,  // Mass Lock Factor Abbreviation
  MNV: null,  // Maneuverability abbreviation
  module: null,
  modules: null,
  no: 'Нет',
  ok: null,
  optimize: null,
  pen: 'ПБ',  // Armour peneration abbreviation
  permalink: 'Постоянная ссылка',
  power: 'Мощность',  // Power = Energy / second. Power generated by the power plant, or power consumed (MW / Mega Watts). Used in the power plant section
  pri: 'Осн', // Priority abbreviation for power management
  proceed: 'продолжить',
  PWR: 'Эн',  // Power Abbreviation. See Power
  qty: null,  // Quantity abbreviation
  range: 'Дальность',
  rate: 'скорость',
  recharge: null, // Shield Recharge time from 50% -> 100%
  recovery: null, // Shield recovery time (after losing shields/turning on -> 50%)
  reload: 'Перезагрузить',  // Reload weapon/hardpoint
  rename: 'Переименовать',
  repair: 'Починка',
  reset: 'Сброс',
  ret: 'Убр.',  // Retracted abbreviation
  retracted: 'Убрано',  // Weapons/Hardpoints retracted
  ROF: 'В/сек', // Rate of Fire abbreviation
  roles: null,  // Commander/Ship build roles - e.g. Trader, Bounty-Hunter, Explorer, etc
  save: 'Сохранить',
  sell: 'Продать',
  settings: 'Настройки',  // Coriolis application settings
  shields: 'Щиты',
  ship: 'Корабль',
  ships: 'Корабли',
  shortened: 'Укороченный', // Standard/Stock build of a ship when purchased new
  size: 'размер',
  skip: 'пропустить', // Skip past something / ignore it
  speed: 'скорость',
  standard: 'Стандартный',  // Standard / Common modules (FSD, power plant, life support, etc)
  Stock: 'Стандартная комплектация',  // Thermal-load abbreviation
  strength: null, // Strength in reference to Shield Strength
  subtotal: null,
  SYS: 'СИСТЕМЫ', // Abbreviation - System recharge rate for power distributor
  time: 'Время',  // time it takes to complete something
  tooltips: null, // Tooltips setting - show/hide
  total: 'Всего',
  Trader: null, // Trader role
  type: 'Тип',
  unladen: 'Пустой',  // No cargo or fuel
  URL: 'Ссылка',  // Link, Uniform Resource Locator
  WEP: 'ОРУДИЯ',  // Abbreviation - Weapon recharge rate for power distributor
  yes: 'Да'
};
