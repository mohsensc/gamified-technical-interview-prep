export const companyList = [
  { id: 'google', label: 'Google', letter: 'G', color: '#4285f4' },
  { id: 'amazon', label: 'Amazon', letter: 'a', color: '#ff9900' },
  { id: 'microsoft', label: 'Microsoft', letter: 'M', color: '#22a06b' },
  { id: 'meta', label: 'Meta', letter: '∞', color: '#0a7cff' },
  { id: 'apple', label: 'Apple', letter: '', color: '#8e98a6' },
  { id: 'bloomberg', label: 'Bloomberg', letter: 'B', color: '#ec4899' },
]

export const companyIds = companyList.map(company => company.id)

export const companyById = Object.fromEntries(companyList.map(company => [company.id, company]))

const letterToCompany = { G: 'google', A: 'amazon', M: 'microsoft', F: 'meta', P: 'apple', B: 'bloomberg' }

const tagTable = `
1 GAMFPB · 2 AMFPB · 3 GAMFPB · 4 GAMFP · 5 AMFPB · 6 AMP · 7 ABP · 8 MFAB · 9 AP · 10 GFM
11 GAFB · 12 AMB · 13 AMPB · 14 AGP · 15 GAMFB · 16 AF · 17 GAFM · 18 AM · 19 AFM · 20 GAMFB
21 AMPB · 22 GAMB · 23 GAFM · 24 AMB · 25 MFA · 26 MAFB · 27 AP · 28 MFA · 29 FM · 30 A
31 GFM · 32 AF · 33 GAFM · 34 GFA · 35 AG · 36 AMP · 37 AM · 38 FAG · 39 AFB · 40 AFB
41 AMF · 42 GAFB · 43 FMA · 44 GF · 45 AM · 46 AFM · 47 FM · 48 AMP · 49 AFGB · 50 FGM
51 AMG · 52 A · 53 AMPB · 54 AMGP · 55 AMG · 56 GFBA · 57 GFA · 58 A · 59 AM · 60 F
61 AM · 62 GAB · 63 AG · 64 GAB · 65 F · 66 GPA · 67 FGA · 68 FG · 69 FMA · 70 AGPB
71 FM · 72 GAM · 73 AMP · 74 AM · 75 MFA · 76 FGAM · 77 AF · 78 FAB · 79 MAB · 80 MF
81 AF · 82 MB · 83 AB · 84 GAMF · 85 GA · 86 MA · 87 G · 88 FMB · 89 A · 90 F
91 FGM · 92 F · 93 MA · 94 M · 95 A · 96 A · 97 G · 98 FAMB · 99 M · 100 AMB
101 MAB · 102 FAMB · 103 MAF · 104 AMG · 105 AMB · 106 MA · 108 AM · 109 F · 110 AGB
111 FA · 112 AMF · 113 AFB · 114 MF · 115 G · 116 MAB · 117 MB · 118 AGP · 119 A · 120 AB
121 AFMB · 122 AB · 123 G · 124 FGAM · 125 FMP · 126 AF · 127 FAGM · 128 GAF · 129 FA · 130 G
131 GA · 133 FGM · 134 AB · 135 A · 136 AP · 138 AMFB · 139 GAFM · 140 G · 141 MAB · 142 MA
143 FAM · 144 M · 145 M · 146 AFMGB · 148 FM · 149 G · 150 AGF · 151 MBP · 152 AF · 153 AFM
155 AGB · 159 G · 160 MAB · 162 FG · 163 G · 165 AM · 166 FG · 167 A · 168 FM · 169 AGP
170 F · 171 GM · 172 MB · 173 FM · 186 M · 187 GA · 188 A · 189 MA · 190 AP · 191 AP
198 AGM · 199 FAB · 200 AGFMB · 202 AP · 203 AB · 204 MA · 205 GP · 206 AMPB · 207 AGM · 208 GAMF
209 FG · 210 GA · 211 FMA · 212 AMGF · 213 AM · 215 FAMB · 216 A · 217 AP · 218 G · 219 A
220 G · 221 GA · 222 G · 224 AMG · 225 MB · 226 GA · 227 FA · 228 G · 229 A · 230 AFB
231 A · 232 AMB · 234 FAM · 235 MA · 236 FAM · 237 MAP · 238 FAMP · 239 GAF · 240 AMG · 241 G
242 AMB · 243 M · 244 M · 246 FG · 249 G · 251 A · 252 FA · 253 GAFB · 254 F · 256 A
257 FG · 258 MA · 259 G · 261 GFM · 263 A · 264 GA · 266 FG · 267 F · 268 MAF · 269 FGA
270 M · 271 GF · 272 G · 273 FMA · 274 M · 277 FA · 278 FM · 279 GA · 280 G · 281 G
282 FG · 283 FAM · 284 G · 285 F · 286 FG · 287 AMB · 289 GAMP · 290 A · 292 AM · 295 GAMF
297 GAMFP · 298 G · 299 G · 300 GMA · 301 FG · 303 F · 304 FA · 307 G · 309 A · 310 GA
312 GA · 314 FB · 315 GA · 316 GA · 317 G · 322 AGM · 323 GFA · 326 G · 328 MAB · 329 GAF
332 GF · 334 F · 337 GA · 338 AP · 340 GF · 341 AFG · 342 F · 344 AMP · 346 G · 347 AFB
348 MA · 349 FA · 350 FA · 354 G · 355 AM · 359 G · 362 G · 367 F · 371 MA · 373 G
378 GF · 380 AGFB · 381 B · 383 A · 384 G · 387 AB · 388 G · 392 F · 394 GAB · 395 B
399 GA · 402 AG · 406 GA · 408 F · 409 G · 410 G · 412 MAP · 415 FG · 416 FA · 417 GA
424 G · 426 FM · 435 FA · 437 A · 438 FAM · 443 MB · 445 MB · 448 G · 449 A · 450 MA
451 GA · 452 AF · 454 A · 456 GA · 457 AF · 460 AG · 463 FAG · 468 MF · 472 AM · 482 G
485 G · 489 G · 490 FG · 494 FA · 496 A · 498 G · 503 GA · 509 AP · 516 A · 518 A
523 FA · 525 FG · 528 FG · 529 F · 539 G · 540 F · 542 AG · 543 FAMG · 547 GAF · 556 B
560 FGA · 562 G · 567 MA · 572 FAM · 588 MA · 605 G · 617 A · 621 FAM · 636 F · 637 FA
642 MA · 643 G · 645 A · 647 FAM · 648 A · 652 G · 653 FA · 658 FGA · 670 FG · 671 A
673 G · 678 FAM · 680 FM · 681 G · 682 AP · 684 GA · 686 G · 687 G · 692 AB · 693 A
694 A · 695 AGF · 701 M · 703 FAB · 704 MA · 706 A · 708 M · 709 A · 713 AG · 716 AM
721 FGA · 725 AM · 729 G · 731 G · 733 MA · 735 AGB · 739 GA · 742 A · 743 AG · 746 A
752 G · 759 AG · 763 A · 767 FGA · 768 G · 771 A · 773 GA · 778 G · 785 FG · 787 AG
791 F · 796 A · 797 FA · 802 G · 815 GA · 819 A · 827 FG · 829 G · 833 G · 834 G
835 G · 836 A · 839 G · 841 G · 843 G · 844 GA · 846 G · 849 G · 852 A · 853 G
855 G · 856 G · 863 AF · 871 G · 875 GF · 876 AP · 886 G · 895 A · 901 A · 904 A
907 A · 909 A · 911 G · 912 GF · 921 FA · 924 G · 929 G · 930 G · 937 A · 938 F
939 G · 940 G · 946 G · 947 G · 953 F · 954 G · 958 F · 973 FAG · 975 G · 977 FG
979 FG · 981 AG · 986 F · 987 FA · 990 G · 992 GA · 994 AMG · 995 G · 997 A · 1004 F
1007 G · 1011 A · 1027 G · 1029 B · 1031 B · 1041 A · 1042 G · 1046 A · 1047 FB · 1048 G
1052 G · 1057 G · 1060 F · 1062 G · 1066 G · 1071 G · 1086 A · 1091 AG · 1094 G · 1099 A
1108 A · 1110 G · 1111 G · 1123 F · 1135 A · 1143 GA · 1146 G · 1152 A · 1155 G · 1161 A
1167 A · 1190 MA · 1197 G · 1201 G · 1209 B · 1216 G · 1218 G · 1219 G · 1235 GA · 1244 B
1249 FGM · 1268 A · 1275 M · 1293 G · 1306 G · 1312 G · 1329 F · 1335 A · 1337 A · 1342 G
1344 M · 1347 G · 1365 A · 1371 A · 1380 A · 1395 F · 1405 G · 1414 G · 1424 F · 1438 GA
1448 MA · 1456 G · 1460 A · 1462 A · 1472 A · 1475 A · 1478 A · 1480 A · 1492 A · 1497 G
1499 G · 1502 A · 1504 G · 1509 A · 1512 A · 1514 G · 1519 M · 1520 G · 1539 F · 1544 G
1567 F · 1570 F · 1584 AG · 1590 F · 1591 G · 1615 A · 1621 G · 1631 GA · 1642 GF · 1644 F
1647 M · 1650 FM · 1653 M · 1657 A · 1658 GA · 1660 G · 1676 A · 1700 A · 1710 A · 1730 GA
1750 M · 1762 F · 1768 MA · 1813 G · 1823 B · 1838 A · 1851 G · 1899 G · 1905 GA · 1929 A
1944 GA · 1970 G · 1971 MA · 2013 G · 2035 G · 2096 M · 2101 A · 2131 G · 2134 G · 2196 M
2214 A · 2225 A · 2244 A · 2246 A · 2265 F · 2272 A · 2290 G · 2300 A · 2306 G · 2353 A
2385 G · 2392 G · 2402 G · 2421 G · 2439 A · 2441 A · 2534 G · 2542 G · 2812 G · 3026 G
`

const parseTagTable = table => {
  const tagsByLc = {}
  for (const entry of table.split(/[·\n]/)) {
    const [lcText, letters] = entry.trim().split(/\s+/)
    if (!lcText || !letters) continue
    tagsByLc[Number(lcText)] = [...new Set([...letters].map(letter => letterToCompany[letter]).filter(Boolean))]
  }
  return tagsByLc
}

export const companyTagsByLc = parseTagTable(tagTable)

const orderCompanies = ids => companyIds.filter(id => ids.includes(id))

export function companiesFor(item) {
  if (!item) return []
  if (Array.isArray(item.companies) && item.companies.length) return orderCompanies(item.companies)
  const fromTable = item.lc ? companyTagsByLc[item.lc] : null
  if (fromTable) return orderCompanies(fromTable)
  return item.google ? ['google'] : []
}

export function matchesCompanies(item, selected) {
  if (!selected || !selected.length) return true
  const tags = companiesFor(item)
  return selected.some(id => tags.includes(id))
}

export function companyCounts(items) {
  const counts = Object.fromEntries(companyIds.map(id => [id, 0]))
  for (const item of items) for (const id of companiesFor(item)) counts[id] = (counts[id] || 0) + 1
  return counts
}
