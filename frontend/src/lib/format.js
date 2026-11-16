import dayjs from 'dayjs'
import 'dayjs/locale/pt'

dayjs.locale('pt')

// Datas no formato usado em toda a interface
export function formatDate(value, withYear = true) {
  if (!value) return '—'
  return dayjs(value).format(withYear ? 'D MMM YYYY' : 'D MMM')
}

export function formatRange(start, end) {
  return `${formatDate(start, false)} - ${formatDate(end)}`
}
