import { format } from 'date-fns'

export const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  try {
    return format(new Date(dateStr), 'dd-MMM-yyyy')
  } catch (e) {
    return '-'
  }
}
