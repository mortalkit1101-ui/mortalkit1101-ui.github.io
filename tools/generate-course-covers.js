const fs = require('node:fs')
const path = require('node:path')

const outputDir = path.join(__dirname, '..', 'source', 'img', 'courses', 'covers')
fs.mkdirSync(outputDir, { recursive: true })

const covers = [
  ['power-learning-roadmap', '00', '电源硬件与数字电源', '学习路线', '#0969da', '#35c2ff', 'roadmap'],
  ['00-study-plan', '00', '微波工程与工程电磁场', '学习计划', '#6f42c1', '#d96bd8', 'radar'],
  ['01-learning-framework', '01', '微波工程', '学习框架', '#5b3cc4', '#8f7cff', 'network'],
  ['02-field-and-potential', '02', '场、电位与高斯定律', 'FIELD & POTENTIAL', '#075985', '#22d3ee', 'field'],
  ['03-electrostatic-boundary-and-capacitance', '03', '静电边界条件与电容', 'ELECTROSTATICS', '#0f766e', '#5eead4', 'capacitor'],
  ['04-static-magnetic-field-and-inductance', '04', '恒定磁场与电感', 'MAGNETIC FIELD', '#1d4ed8', '#60a5fa', 'coil'],
  ['05-maxwell-equations', '05', 'Maxwell 方程与时变场', 'MAXWELL EQUATIONS', '#4338ca', '#a78bfa', 'maxwell'],
  ['06-plane-waves', '06', '平面电磁波', 'PLANE WAVES', '#0369a1', '#38bdf8', 'waves'],
  ['07-uniform-transmission-lines', '07', '均匀传输线', 'TRANSMISSION LINE', '#0f766e', '#2dd4bf', 'line'],
  ['08-waveguides-and-cavities', '08', '波导与谐振腔', 'WAVEGUIDE', '#9a3412', '#fb923c', 'waveguide'],
  ['09-microwave-electromagnetics', '09', '微波电磁理论', 'MICROWAVE EM', '#7e22ce', '#e879f9', 'antenna'],
  ['10-microwave-transmission-lines', '10', '微波传输线理论', 'MICROSTRIP', '#155e75', '#22d3ee', 'microstrip'],
  ['11-transmission-lines-and-waveguides', '11', '传输线和波导', 'LINES & GUIDES', '#1e40af', '#818cf8', 'hybrid'],
  ['12-microwave-network-analysis', '12', '微波网络分析', 'S-PARAMETERS', '#166534', '#4ade80', 'twoport'],
  ['13-impedance-matching', '13', '阻抗匹配和调谐', 'IMPEDANCE MATCHING', '#9f1239', '#fb7185', 'smith'],
  ['14-microwave-resonators', '14', '微波谐振器', 'RESONATORS', '#7c2d12', '#fbbf24', 'resonator'],
  ['15-power-dividers-and-couplers', '15', '功分器与定向耦合器', 'DIVIDERS & COUPLERS', '#065f46', '#34d399', 'divider'],
  ['16-microwave-filters', '16', '微波滤波器', 'MICROWAVE FILTERS', '#1e3a8a', '#60a5fa', 'filter'],
  ['17-microwave-systems', '17', '微波系统与选学专题', 'MICROWAVE SYSTEMS', '#581c87', '#c084fc', 'system']
]

const drawings = {
  roadmap: '<path d="M680 430h110v-90h110v-90h120"/><circle cx="680" cy="430" r="18"/><circle cx="790" cy="340" r="18"/><circle cx="900" cy="250" r="18"/><path d="m1000 220 45 30-45 30"/>',
  radar: '<circle cx="850" cy="335" r="150"/><circle cx="850" cy="335" r="95"/><circle cx="850" cy="335" r="42"/><path d="M850 335 1030 210M700 335h300M850 185v300"/><circle cx="945" cy="268" r="13" fill="#fff"/>',
  network: '<circle cx="740" cy="230" r="34"/><circle cx="940" cy="210" r="34"/><circle cx="1030" cy="380" r="34"/><circle cx="810" cy="450" r="34"/><path d="m770 230 136-17m53 27 56 108m-18 55-153 38m-25-30-60-148m38 10 117 91"/>',
  field: '<circle cx="760" cy="335" r="48"/><circle cx="1010" cy="335" r="48"/><path d="M808 300c70-70 130-70 154 0M808 335h154M808 370c70 70 130 70 154 0"/><path d="M745 335h30m-15-15v30M995 335h30"/>',
  capacitor: '<path d="M810 180v310M930 180v310M690 335h120m120 0h120"/><path d="M835 230h70m-70 70h70m-70 70h70m-70 70h70"/>',
  coil: '<path d="M690 335h70c0-90 90-90 90 0s90 90 90 0 90-90 90 0h60"/><path d="M760 210c90-70 210-70 300 0M760 460c90 70 210 70 300 0"/>',
  maxwell: '<path d="M700 250c80-90 180-90 260 0s80 180 0 250M1030 420c-80 90-180 90-260 0s-80-180 0-250"/><text x="815" y="370" font-size="95" fill="#fff" stroke="none">∇×</text>',
  waves: '<path d="M670 335c55-150 110-150 165 0s110 150 165 0 110-150 165 0"/><path d="M670 440c55-90 110-90 165 0s110 90 165 0 110-90 165 0"/>',
  line: '<path d="M680 255h440M680 415h440M780 255v160m120-160v160m120-160v160"/>',
  waveguide: '<path d="m720 210 300 55v250l-300-55zm0 0 90-45 300 55-90 45m90-45v250l-90 45M750 335c70-90 150-90 240 0"/>',
  antenna: '<path d="M820 470V320m-70 150h140M820 320l-65-90m65 90 65-90M905 265c70 45 70 105 0 150M950 220c125 75 125 195 0 270"/>',
  microstrip: '<path d="M700 420h410M735 360h340M815 280h180M815 280v80m180-80v80M735 360v60m340-60v60"/>',
  hybrid: '<circle cx="770" cy="330" r="90"/><circle cx="770" cy="330" r="35"/><path d="M680 330h-45m225 0h80m0-110 150 35v170l-150 35zm0 0v240"/>',
  twoport: '<rect x="790" y="235" width="250" height="200" rx="24"/><path d="M670 290h120m250 0h100M670 380h120m250 0h100"/><text x="850" y="365" font-size="80" fill="#fff" stroke="none">S</text>',
  smith: '<circle cx="880" cy="335" r="170"/><circle cx="795" cy="335" r="85"/><circle cx="965" cy="250" r="85"/><circle cx="965" cy="420" r="85"/><path d="M710 335h340"/>',
  resonator: '<circle cx="860" cy="335" r="165"/><circle cx="860" cy="335" r="105"/><circle cx="860" cy="335" r="45"/><path d="M1025 335h100M695 335h-60"/>',
  divider: '<path d="M680 335h170m0 0 190-120m-190 120 190 120"/><circle cx="850" cy="335" r="26"/>',
  filter: '<path d="M665 260c35 0 35 150 70 150s35-150 70-150 35 150 70 150 35-150 70-150M1000 420h145M1000 420c35 0 45-175 90-175s45 175 55 175"/>',
  system: '<rect x="665" y="275" width="120" height="120" rx="18"/><rect x="850" y="275" width="120" height="120" rx="18"/><rect x="1035" y="275" width="120" height="120" rx="18"/><path d="M785 335h65m120 0h65"/>'
}

const escapeXml = value => value.replace(/[<>&'"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c])

for (const [slug, number, title, subtitle, from, to, drawing] of covers) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient><radialGradient id="glow"><stop stop-color="#fff" stop-opacity=".28"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient><pattern id="grid" width="42" height="42" patternUnits="userSpaceOnUse"><path d="M42 0H0v42" fill="none" stroke="#fff" stroke-opacity=".08"/></pattern></defs><rect width="1200" height="675" rx="36" fill="url(#bg)"/><rect width="1200" height="675" rx="36" fill="url(#grid)"/><circle cx="920" cy="330" r="330" fill="url(#glow)"/><text x="72" y="130" fill="#fff" opacity=".72" font-family="Arial,sans-serif" font-size="46" font-weight="700">CHAPTER ${number}</text><text x="72" y="280" fill="#fff" font-family="Microsoft YaHei,Noto Sans SC,sans-serif" font-size="58" font-weight="700">${escapeXml(title)}</text><text x="76" y="350" fill="#fff" opacity=".78" font-family="Arial,Microsoft YaHei,sans-serif" font-size="28" letter-spacing="3">${escapeXml(subtitle)}</text><path d="M75 405h420" stroke="#fff" stroke-opacity=".55" stroke-width="4"/><g fill="none" stroke="#fff" stroke-opacity=".9" stroke-width="12" stroke-linecap="round" stroke-linejoin="round">${drawings[drawing]}</g><circle cx="90" cy="590" r="8" fill="#fff"/><path d="M115 590h310" stroke="#fff" stroke-opacity=".45" stroke-width="4"/></svg>`
  fs.writeFileSync(path.join(outputDir, `${slug}.svg`), svg, 'utf8')
}

console.log(`Generated ${covers.length} course covers.`)
