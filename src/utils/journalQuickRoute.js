const typeSlugToId = {
  asset: 'Asset',
  assets: 'Asset',
  liability: 'Liability',
  liabilities: 'Liability',
  equity: 'Equity',
  income: 'Income',
  expense: 'Expense',
  expenses: 'Expense',
  expence: 'Expense',
  expences: 'Expense',
}

const typeIdToSlug = {
  Asset: 'assets',
  Liability: 'liabilities',
  Equity: 'equity',
  Income: 'income',
  Expense: 'expenses',
}

function slugify(value) {
  if (!value) return ''
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function accountToSlug(account) {
  return slugify(account?.name) || slugify(account?.code)
}

function normalizeTypeSlug(slug) {
  const normalized = slugify(slug)
  return typeSlugToId[normalized] || null
}

function typeToSlug(type) {
  if (!type) return ''
  return typeIdToSlug[type] || slugify(type)
}

function buildQuickJournalPath(type, account) {
  const typeSlug = typeToSlug(type)
  if (!typeSlug) return null
  if (!account) return `/journals/quick/${typeSlug}`
  const accountSlug = accountToSlug(account)
  if (!accountSlug) return null
  return `/journals/quick/${typeSlug}/${accountSlug}`
}

function getQuickJournalPathForAccount(account) {
  if (!account) return null
  return buildQuickJournalPath(account.type, account)
}

export {
  accountToSlug,
  buildQuickJournalPath,
  getQuickJournalPathForAccount,
  normalizeTypeSlug,
  slugify,
  typeToSlug,
}
