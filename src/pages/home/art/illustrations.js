/*
 * Line-art illustrations for the Dreams and Who cards.
 *
 * Every drawing sits on the same 240 × 160 grid with its ground at y≈140, so
 * the cards read as one set. Each one is plain data for <LineArt>:
 *
 *   strokes  thin ink outlines, drawn in order (the draw-in follows it)
 *   soft     the card's own tint as a wash behind the lines
 *   accent   one small detail in the card's stronger colour
 *
 * No text inside the art, so both languages share it.
 */

const VIEWBOX = '0 0 240 160';

/* ── path helpers ────────────────────────────────────────────────────────── */

const rect = (x, y, w, h, r = 0) =>
  r
    ? `M${x + r} ${y}H${x + w - r}Q${x + w} ${y} ${x + w} ${y + r}V${y + h - r}Q${x + w} ${y + h} ${x + w - r} ${y + h}H${x + r}Q${x} ${y + h} ${x} ${y + h - r}V${y + r}Q${x} ${y} ${x + r} ${y}Z`
    : `M${x} ${y}H${x + w}V${y + h}H${x}Z`;

const circle = (cx, cy, r) => `M${cx - r} ${cy}A${r} ${r} 0 1 0 ${cx + r} ${cy}A${r} ${r} 0 1 0 ${cx - r} ${cy}Z`;

const ellipse = (cx, cy, rx, ry) =>
  `M${cx - rx} ${cy}A${rx} ${ry} 0 1 0 ${cx + rx} ${cy}A${rx} ${ry} 0 1 0 ${cx - rx} ${cy}Z`;

/** short rays around a centre, between two radii, at the given angles (degrees) */
const rays = (cx, cy, r1, r2, angles) =>
  angles
    .map((a) => {
      const rad = (a * Math.PI) / 180;
      const p = (r) => `${(cx + r * Math.cos(rad)).toFixed(1)} ${(cy - r * Math.sin(rad)).toFixed(1)}`;
      return `M${p(r1)}L${p(r2)}`;
    })
    .join('');

/** a heart whose point is at (x, y), `s` wide */
const heart = (x, y, s) => {
  const k = s / 40;
  const p = (dx, dy) => `${(x + dx * k).toFixed(1)} ${(y + dy * k).toFixed(1)}`;
  return `M${p(0, 0)}C${p(-12, -10)} ${p(-20, -16)} ${p(-20, -24)}C${p(-20, -30)} ${p(-15, -34)} ${p(-10, -34)}C${p(-6, -34)} ${p(-2, -31)} ${p(0, -28)}C${p(2, -31)} ${p(6, -34)} ${p(10, -34)}C${p(15, -34)} ${p(20, -30)} ${p(20, -24)}C${p(20, -16)} ${p(12, -10)} ${p(0, 0)}Z`;
};

const GROUND = 'M12 140H228';

/* ── dreams ──────────────────────────────────────────────────────────────── */

const bungalow = {
  viewBox: VIEWBOX,
  soft: ['M46 82L112 40L178 82Z', circle(202, 102, 16)],
  accent: [rect(132, 94, 22, 18, 2)],
  strokes: [
    GROUND,
    'M46 82L112 40L178 82Z',
    'M144 60V44H156V68',
    'M56 82V140M168 82V140',
    rect(102, 106, 20, 34, 2),
    rect(70, 94, 22, 18, 2),
    'M81 94V112M70 103H92',
    rect(132, 94, 22, 18, 2),
    'M143 94V112M132 103H154',
    'M202 140V118',
    circle(202, 102, 16),
    'M20 140C20 128 38 128 38 140',
  ],
};

const car = {
  viewBox: VIEWBOX,
  soft: [
    'M44 124V110C44 104 48 100 54 99L82 95L102 74C105 71 109 69 114 69H156C163 69 169 72 174 79L188 96L198 98C204 99 208 104 208 110V124Z',
  ],
  accent: [rect(198, 103, 8, 6, 2)],
  strokes: [
    'M12 140H228',
    'M30 152H50M110 152H130M190 152H210',
    'M44 124V110C44 104 48 100 54 99L82 95L102 74C105 71 109 69 114 69H156C163 69 169 72 174 79L188 96L198 98C204 99 208 104 208 110V124H190M162 124H90M62 124H44',
    'M106 94L117 80H140V94Z',
    'M148 80H160C165 80 168 82 171 86L177 94H148Z',
    'M144 98V120',
    circle(76, 124, 14),
    circle(76, 124, 5),
    circle(176, 124, 14),
    circle(176, 124, 5),
    'M14 104H30M8 114H28M16 124H32',
  ],
};

const office = {
  viewBox: VIEWBOX,
  soft: [rect(70, 34, 72, 106, 3)],
  accent: [rect(100, 62, 12, 10, 1)],
  strokes: [
    GROUND,
    rect(70, 34, 72, 106, 3),
    'M106 34V20M106 20L118 24L106 28',
    [46, 62, 78, 94].map((y) => [80, 100, 120].map((x) => rect(x, y, 12, 10, 1)).join('')).join(''),
    rect(96, 118, 20, 22, 1),
    'M88 118H124',
    rect(142, 76, 56, 64, 3),
    [88, 106].map((y) => [152, 176].map((x) => rect(x, y, 12, 10, 1)).join('')).join(''),
    circle(44, 116, 12),
    'M44 128V140',
  ],
};

const trips = {
  viewBox: VIEWBOX,
  soft: [circle(96, 92, 40), rect(160, 100, 44, 32, 4)],
  accent: ['M180 40L208 54L186 58Z'],
  strokes: [
    circle(96, 92, 40),
    'M96 52C76 72 76 112 96 132C116 112 116 72 96 52',
    'M56 92H136',
    'M62 72C80 78 112 78 130 72M62 112C80 106 112 106 130 112',
    'M40 46l6 -4M54 37l7 -3M70 30l7 -2M86 25l8 -1M104 23h8M122 23l8 1M140 26l7 2M156 31l7 3',
    'M180 40L208 54L186 58ZM186 58L190 50L208 54',
    rect(160, 100, 44, 32, 4),
    'M174 100V94H190V100',
    'M172 100V132M192 100V132',
    'M70 144H122M150 140H216',
  ],
};

const retired = {
  viewBox: VIEWBOX,
  soft: ['M206 132L210 116H226L230 132Z'],
  accent: ['M38 118A26 26 0 0 1 90 118Z'],
  strokes: [
    'M8 118H118',
    'M38 118A26 26 0 0 1 90 118',
    rays(64, 118, 33, 42, [30, 60, 90, 120, 150]),
    'M20 128H60M32 136H82',
    'M134 86H192M134 98H192',
    'M134 84V132M190 84V132',
    'M126 112H198',
    'M110 132H232',
    'M206 132L210 116H226L230 132Z',
    'M218 116C212 104 214 96 218 90C222 96 224 104 218 116',
    'M218 112C209 109 205 103 204 98M218 112C227 109 231 103 232 98',
    'M146 46q5 -5 10 0q5 -5 10 0M176 34q4 -4 8 0q4 -4 8 0',
  ],
};

const money = {
  viewBox: VIEWBOX,
  soft: ['M122 72L184 60L192 94L130 106Z', 'M50 102V132A30 8 0 0 0 110 132V102Z'],
  accent: [ellipse(80, 102, 30, 8)],
  strokes: [
    'M16 142H224',
    'M50 102V132A30 8 0 0 0 110 132V102',
    'M50 112A30 8 0 0 0 110 112M50 122A30 8 0 0 0 110 122',
    ellipse(80, 102, 30, 8),
    'M136 120V134A24 7 0 0 0 184 134V120',
    'M136 127A24 7 0 0 0 184 127',
    ellipse(160, 120, 24, 7),
    'M122 72L184 60L192 94L130 106Z',
    circle(157, 83, 8),
    'M30 80L52 62L64 70L92 44',
    'M82 44H92V54',
    'M208 32V46M201 39H215',
  ],
};

/* ── who ─────────────────────────────────────────────────────────────────── */

const BOOK_LEFT = 'M120 128C100 118 72 118 52 124V84C72 78 100 78 120 88Z';
const BOOK_RIGHT = 'M120 128C140 118 168 118 188 124V84C168 78 140 78 120 88Z';

const student = {
  viewBox: VIEWBOX,
  soft: [BOOK_LEFT, BOOK_RIGHT],
  accent: ['M158 66H166L164 76H160Z'],
  strokes: [
    'M60 138H180',
    BOOK_LEFT,
    BOOK_RIGHT,
    'M64 96C80 92 96 92 108 98M64 106C80 102 96 102 108 108',
    'M132 98C144 92 160 92 176 96M132 108C144 102 160 102 176 106',
    'M120 30L162 46L120 62L78 46Z',
    'M96 54V66C108 74 132 74 144 66V54',
    'M162 46V66',
    'M158 66H166L164 76H160Z',
    'M200 132L218 98L226 102L208 136L198 140Z',
    'M200 132L208 136',
  ],
};

const HOUSE = 'M40 140V76L104 34L168 76V140Z';

const homemaker = {
  viewBox: VIEWBOX,
  soft: [HOUSE, 'M186 112C184 100 188 92 198 92C208 92 212 100 210 112Z'],
  accent: [heart(104, 104, 38)],
  strokes: [
    'M8 140H232',
    'M40 140V76L104 34L168 76V140',
    heart(104, 104, 38),
    'M92 140V118H116V140',
    'M178 112H232',
    'M186 112C184 100 188 92 198 92C208 92 212 100 210 112Z',
    'M210 104L218 96',
    'M191 95C191 85 205 85 205 95',
    'M198 92V88',
    'M196 82C192 78 200 74 196 68',
    'M16 140L19 126H33L36 140',
    'M26 126C21 116 23 108 26 104C29 108 31 116 26 126',
  ],
};

const working = {
  viewBox: VIEWBOX,
  soft: ['M58 116H162L156 122H64Z', 'M170 100H190V114C190 118 187 120 184 120H176C173 120 170 118 170 114Z'],
  accent: [rect(78, 72, 64, 38, 2)],
  strokes: [
    'M24 122H216',
    'M40 122V140M200 122V140',
    'M70 116V70C70 67 72 65 75 65H145C148 65 150 67 150 70V116',
    'M58 116H162L156 122H64Z',
    rect(78, 72, 64, 38, 2),
    'M86 82H118M86 92H130M86 100H110',
    'M170 100H190V114C190 118 187 120 184 120H176C173 120 170 118 170 114Z',
    'M190 104C196 104 196 112 190 112',
    'M176 94C172 88 180 84 176 78M184 94C180 88 188 84 184 78',
    circle(196, 40, 14),
    'M196 32V40L202 44',
  ],
};

const AWNING_TOP = 'M40 50H200L208 70H32Z';
const scallops = Array.from({ length: 8 }, () => 'q11 10 22 0').join('');
const stripes = [1, 3, 5, 7].map((i) => `M${40 + 20 * i} 50H${60 + 20 * i}L${54 + 22 * i} 70H${32 + 22 * i}Z`);

const business = {
  viewBox: VIEWBOX,
  soft: [rect(44, 70, 152, 70), rect(56, 82, 60, 40, 3)],
  accent: stripes,
  strokes: [
    'M12 140H228',
    'M44 140V70M196 140V70',
    AWNING_TOP,
    `M32 70${scallops}`,
    rect(56, 82, 60, 40, 3),
    'M56 102H116',
    'M150 78V84M174 78V84',
    rect(144, 84, 36, 16, 3),
    'M152 92H172',
    rect(146, 106, 32, 34, 2),
    'M172 124h0.5',
  ],
};

const HILL = 'M8 112C50 92 90 96 130 104C170 112 200 96 232 90V140H8Z';

const retiree = {
  viewBox: VIEWBOX,
  soft: [HILL],
  accent: [heart(190, 74, 24)],
  strokes: [
    'M8 112C50 92 90 96 130 104C170 112 200 96 232 90',
    'M8 140H232',
    circle(84, 122, 18),
    circle(156, 122, 18),
    'M84 122L108 96L118 122ZM108 96H144L118 122M144 96L156 122',
    'M102 90H114M108 90V96',
    'M144 96L140 86H150',
    'M118 122L124 128',
    heart(190, 74, 24),
  ],
};

export const ART = { bungalow, car, office, trips, retired, money, student, homemaker, working, business, retiree };
