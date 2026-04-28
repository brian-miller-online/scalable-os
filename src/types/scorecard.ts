export type StatusColor =
  | 'dark_green'
  | 'lime_green'
  | 'yellow'
  | 'light_red'
  | 'dark_red'
  | 'not_set'

export const STATUS_COLORS: Record<Exclude<StatusColor, 'not_set'>, string> = {
  dark_green: '#1B7A3D',
  lime_green: '#7BC67E',
  yellow: '#F5C518',
  light_red: '#E8685A',
  dark_red: '#B71C1C',
}

export const NOTE_REQUIRED_COLORS: StatusColor[] = ['yellow', 'light_red', 'dark_red']

export const NOTE_PLACEHOLDERS: Partial<Record<StatusColor, string>> = {
  yellow: "What's your plan to catch up?",
  light_red: 'What happened?',
  dark_red: "What went wrong? What's Plan B?",
}
