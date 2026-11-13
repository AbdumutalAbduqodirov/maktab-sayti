const oylar = ['yanvar','fevral','mart','aprel','may','iyun','iyul','avgust','sentabr','oktabr','noyabr','dekabr']

export function formatDate(value) {
  if (!value) return ''
  const d = new Date(value)
  return `${d.getDate()}-${oylar[d.getMonth()]}, ${d.getFullYear()}`
}