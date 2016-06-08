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
  PHRASE_FASTEST_RANGE: 'Последовательные прыжки максимальной дальности',  // Consecutive max range jumps
  PHRASE_IMPORT: 'Для импорта вставьте код в эту форму',  // Paste JSON or import here
  PHRASE_LADEN: 'Масса корабля с учётом топлива и грузов',  // Ship Mass + Fuel + Cargo
  PHRASE_NO_BUILDS: 'Нечего сравнивать',  // No builds added to comparison!
  PHRASE_NO_RETROCH: 'нет ранних версий сборки\\конфигурации',  // No Retrofitting changes
  PHRASE_SELECT_BUILDS: 'Выберите конфигурацию для сравнения',  // Select Builds to Compare
  PHRASE_SG_RECHARGE: 'восстановление с 60% до 100% объема щита', // Time from 50% to 100% Charge
  PHRASE_SG_RECOVER: 'восстановление [до 60%] после снятия щита',  // Recovery (to 50%) after collapse
  PHRASE_UNLADEN: 'Масса корабля без учета топлива и грузов', // Ship Mass excluding Fuel and Cargo
  PHRASE_UPDATE_RDY: 'Доступно обновление. Нажмите для обновления.',  // Update Available! Click to Refresh

  // Units / Metrics
  '/s': '/с', // Per second
  'm/s': 'м/с', // Meters / Second
  Ls: 'Св.сек', // Light seconds
  LY: 'Св.лет', // Light Years
  CR: 'кр.',  // Credits abbreviation

  // Sizes
  S: 'M', // Small Hardpoint (single Character)
  M: 'С', // Medium Hardpoint size (single character)
  L: 'б', // Large Hardpoint size (single character)
  H: 'O', // Huge Hardpoint size (single character)
  U: 'B', // Utility Hardpoint size (single character) - Kill warrant scanner, etc
  small: 'Малый', // Small ship size
  medium: 'Средний',  // Medium ship size
  large: 'большой', // Large Ship Size
  // Insurance
  alpha: 'Альфа', // Alpha backer insurance level
  beta: 'Бета', // Beta back insurance level
  standard: 'Стандартный',  // Standard insurance level
  // Terms
  'build name': 'название сборки',  // Ship build/configuration/design name
  'compare all': 'сравнить все',
  'create new': 'Создать новый',
  'damage per second': 'урон в секунду',
  'delete all': 'Удалить все',
  'detailed export': 'Подробный экспорт',
  'edit data': 'Редактирование',
  'empty all': 'пусто все',
  'Enter Name': 'Введите имя',
  'fastest range': 'быстрый диапазон',  // Fastet totaljump range - sum of succesive jumps
  'fuel level': 'уровень топлива',  // Percent of fuel (T) in the tank
  'full tank': 'Полный бак',
  'internal compartments': 'внутренние отсеки',
  'jump range': 'Дальность прыжка',
  'mass lock factor': 'Масс. блок',
  'max mass': 'Максимальная масса',
  'net cost': 'разница в цене',
  'none created': 'не создано',
  'refuel time': 'Время дозаправки',  // Time to refuel the tank when scooping
  'retrofit costs': 'цена модификации', // The cost difference when upgrading / downgrading a component
  'retrofit from': 'модификация от',  // Retrofit from Build A against build B
  'T-Load': 'Тепл.',  // Thermal load abbreviation
  'utility mounts': 'Вспомогательное оборудование',
  about: 'О ...', // Link to about page / about Coriolis.io
  action: 'Действие',
  added: 'Добавлено',
  ammo: 'Боекомплект',  // Ammunition
  armour: 'Броня',
  available: 'доступно',  // Available options
  backup: 'Резервная копия',
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
  export: 'Экспорт',
  forum: 'Форум',
  fuel: 'Топливо',
  hardpoints: 'Орудийные порты',
  hull: 'Корпус', // Ships hull
  import: 'импортировать ',
  insurance: 'Страховка',

  jumps: 'Прыжков',
  laden: 'Груженый',
  language: 'Язык',
  maneuverability: 'Маневренность',

  mass: 'Масса',
  max: 'Макс',

  no: 'Нет',
  pen: 'ПБ',  // Armour peneration abbreviation
  permalink: 'Постоянная ссылка',
  power: 'Мощность',  // Power = Energy / second. Power generated by the power plant, or power consumed (MW / Mega Watts). Used in the power plant section
  pri: 'Осн', // Priority abbreviation for power management
  proceed: 'продолжить',
  PWR: 'Эн',  // Power Abbreviation. See Power
  range: 'Дальность',
  rate: 'скорость',
  recharge: 'перезарядка',  // Shield Recharge time from 50% -> 100%
  recovery: 'включение',  // Shield recovery time (after losing shields/turning on -> 50%)
  reload: 'Перезагрузить',  // Reload weapon/hardpoint
  rename: 'Переименовать',
  repair: 'Починка',
  reset: 'Сброс',
  ret: 'Убр.',  // Retracted abbreviation
  retracted: 'Убрано',  // Weapons/Hardpoints retracted
  ROF: 'В/сек', // Rate of Fire abbreviation

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
  SYS: 'СИСТЕМЫ', // Abbreviation - System recharge rate for power distributor
  time: 'Время',  // time it takes to complete something
  total: 'Всего',
  type: 'Тип',
  unladen: 'Пустой',  // No cargo or fuel
  URL: 'Ссылка',  // Link, Uniform Resource Locator
  WEP: 'ОРУДИЯ',  // Abbreviation - Weapon recharge rate for power distributor
  yes: 'Да'
};
