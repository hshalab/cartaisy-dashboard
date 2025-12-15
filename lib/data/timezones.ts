export interface Timezone {
  value: string;
  label: string;
  offset: string;
}

export const TIMEZONES: Timezone[] = [
  // UTC
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)', offset: 'UTC+0' },

  // Americas
  { value: 'America/Los_Angeles', label: 'Pacific Time (Los Angeles)', offset: 'UTC-8' },
  { value: 'America/Denver', label: 'Mountain Time (Denver)', offset: 'UTC-7' },
  { value: 'America/Chicago', label: 'Central Time (Chicago)', offset: 'UTC-6' },
  { value: 'America/New_York', label: 'Eastern Time (New York)', offset: 'UTC-5' },
  { value: 'America/Toronto', label: 'Eastern Time (Toronto)', offset: 'UTC-5' },
  { value: 'America/Mexico_City', label: 'Central Time (Mexico City)', offset: 'UTC-6' },
  { value: 'America/Sao_Paulo', label: 'Brasília Time (São Paulo)', offset: 'UTC-3' },
  { value: 'America/Buenos_Aires', label: 'Argentina Time (Buenos Aires)', offset: 'UTC-3' },

  // Europe
  { value: 'Europe/London', label: 'Greenwich Mean Time (London)', offset: 'UTC+0' },
  { value: 'Europe/Paris', label: 'Central European Time (Paris)', offset: 'UTC+1' },
  { value: 'Europe/Berlin', label: 'Central European Time (Berlin)', offset: 'UTC+1' },
  { value: 'Europe/Amsterdam', label: 'Central European Time (Amsterdam)', offset: 'UTC+1' },
  { value: 'Europe/Madrid', label: 'Central European Time (Madrid)', offset: 'UTC+1' },
  { value: 'Europe/Rome', label: 'Central European Time (Rome)', offset: 'UTC+1' },
  { value: 'Europe/Moscow', label: 'Moscow Standard Time', offset: 'UTC+3' },
  { value: 'Europe/Istanbul', label: 'Eastern European Time (Istanbul)', offset: 'UTC+3' },

  // Asia
  { value: 'Asia/Dubai', label: 'Gulf Standard Time (Dubai)', offset: 'UTC+4' },
  { value: 'Asia/Kolkata', label: 'Indian Standard Time (Delhi)', offset: 'UTC+5:30' },
  { value: 'Asia/Bangkok', label: 'Indochina Time (Bangkok)', offset: 'UTC+7' },
  { value: 'Asia/Singapore', label: 'Singapore Standard Time', offset: 'UTC+8' },
  { value: 'Asia/Hong_Kong', label: 'Hong Kong Time', offset: 'UTC+8' },
  { value: 'Asia/Shanghai', label: 'China Standard Time (Shanghai)', offset: 'UTC+8' },
  { value: 'Asia/Tokyo', label: 'Japan Standard Time (Tokyo)', offset: 'UTC+9' },
  { value: 'Asia/Seoul', label: 'Korea Standard Time (Seoul)', offset: 'UTC+9' },
  { value: 'Asia/Manila', label: 'Philippine Time (Manila)', offset: 'UTC+8' },

  // Pacific
  { value: 'Australia/Sydney', label: 'Australian Eastern Time (Sydney)', offset: 'UTC+11' },
  { value: 'Australia/Melbourne', label: 'Australian Eastern Time (Melbourne)', offset: 'UTC+11' },
  { value: 'Australia/Perth', label: 'Australian Western Time (Perth)', offset: 'UTC+8' },
  { value: 'Pacific/Auckland', label: 'New Zealand Standard Time (Auckland)', offset: 'UTC+13' },

  // Africa
  { value: 'Africa/Johannesburg', label: 'South Africa Standard Time', offset: 'UTC+2' },
  { value: 'Africa/Cairo', label: 'Eastern European Time (Cairo)', offset: 'UTC+2' },
  { value: 'Africa/Lagos', label: 'West Africa Time', offset: 'UTC+1' },
];
