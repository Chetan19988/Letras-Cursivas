// Builds 500 unique Unicode letter styles for the Generador de Letras Cursivas.
const UP = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LO = 'abcdefghijklmnopqrstuvwxyz';

function seq(start, n) {
  const out = [];
  for (let i = 0; i < n; i++) out.push(String.fromCodePoint(start + i));
  return out;
}

function math(up, lo, dig, exc = {}) {
  const u = up ? seq(up, 26) : null;
  const l = lo ? seq(lo, 26) : null;
  const d = dig ? seq(dig, 10) : null;
  const map = {};
  if (u) UP.split('').forEach((c, i) => (map[c] = u[i]));
  if (l) LO.split('').forEach((c, i) => (map[c] = l[i]));
  if (d) '0123456789'.split('').forEach((c, i) => (map[c] = d[i]));
  Object.assign(map, exc);
  return map;
}

function fromStrings(lower, upper, digits) {
  const map = {};
  const l = Array.from(lower);
  const u = upper ? Array.from(upper) : l;
  LO.split('').forEach((c, i) => (map[c] = l[i]));
  UP.split('').forEach((c, i) => (map[c] = u[i]));
  if (digits) Array.from(digits).forEach((d, i) => (map[String(i)] = d));
  return map;
}

function upperOnly(start) {
  const map = {};
  UP.split('').forEach((c, i) => {
    const ch = String.fromCodePoint(start + i);
    map[c] = ch;
    map[c.toLowerCase()] = ch;
  });
  return map;
}

// Strip accents so "canción" -> "cancion" can be converted where possible
function normalize(t) {
  return t.replace(/[áàäâÁÀÄÂéèëêÉÈËÊíìïîÍÌÏÎóòöôÓÒÖÔúùüûÚÙÜÛ]/g, (c) =>
    c.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  );
}

const circled = (() => {
  const m = math(0x24b6, 0x24d0, null);
  m['0'] = '⓪';
  '123456789'.split('').forEach((d, i) => (m[d] = String.fromCodePoint(0x2460 + i)));
  return m;
})();

const paren = (() => {
  const m = math(0x1f110, 0x249c, null);
  '123456789'.split('').forEach((d, i) => (m[d] = String.fromCodePoint(0x2474 + i)));
  return m;
})();

// Base alphabets
export const BASES = {
  primary: [
    { name: 'Cursiva', tags: ['cursiva'], map: math(0x1d49c, 0x1d4b6, null, { B: 'ℬ', E: 'ℰ', F: 'ℱ', H: 'ℋ', I: 'ℐ', L: 'ℒ', M: 'ℳ', R: 'ℛ', e: 'ℯ', g: 'ℊ', o: 'ℴ' }) },
    { name: 'Cursiva Negrita', tags: ['cursiva', 'negrita'], map: math(0x1d4d0, 0x1d4ea, 0x1d7ce) },
    { name: 'Cursiva Serif', tags: ['cursiva'], map: math(0x1d434, 0x1d44e, null, { h: 'ℎ' }) },
    { name: 'Cursiva Serif Negrita', tags: ['cursiva', 'negrita'], map: math(0x1d468, 0x1d482, 0x1d7ce) },
    { name: 'Itálica Moderna', tags: ['cursiva'], map: math(0x1d608, 0x1d622, 0x1d7e2) },
    { name: 'Itálica Moderna Negrita', tags: ['cursiva', 'negrita'], map: math(0x1d63c, 0x1d656, 0x1d7ec) },
    { name: 'Gótica', tags: ['gotica'], map: math(0x1d504, 0x1d51e, null, { C: 'ℭ', H: 'ℌ', I: 'ℑ', R: 'ℜ', Z: 'ℨ' }) },
    { name: 'Gótica Negrita', tags: ['gotica', 'negrita'], map: math(0x1d56c, 0x1d586, 0x1d7ce) },
  ],
  secondary: [
    { name: 'Negrita Serif', tags: ['negrita'], map: math(0x1d400, 0x1d41a, 0x1d7ce) },
    { name: 'Negrita Sans', tags: ['negrita'], map: math(0x1d5d4, 0x1d5ee, 0x1d7ec) },
    { name: 'Doble Línea', tags: ['otras'], map: math(0x1d538, 0x1d552, 0x1d7d8, { C: 'ℂ', H: 'ℍ', N: 'ℕ', P: 'ℙ', Q: 'ℚ', R: 'ℝ', Z: 'ℤ' }) },
    { name: 'Sans Serif', tags: ['otras'], map: math(0x1d5a0, 0x1d5ba, 0x1d7e2) },
    { name: 'Máquina de Escribir', tags: ['otras'], map: math(0x1d670, 0x1d68a, 0x1d7f6) },
    { name: 'Ancho Completo', tags: ['otras'], map: math(0xff21, 0xff41, 0xff10) },
    { name: 'Burbujas', tags: ['otras'], map: circled },
    { name: 'Burbujas Negras', tags: ['otras'], map: upperOnly(0x1f150) },
    { name: 'Cuadrados', tags: ['otras'], map: upperOnly(0x1f130) },
    { name: 'Cuadrados Negros', tags: ['otras'], map: upperOnly(0x1f170) },
    { name: 'Paréntesis', tags: ['otras'], map: paren },
    { name: 'Versalitas', tags: ['otras'], map: fromStrings('ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘǫʀꜱᴛᴜᴠᴡxʏᴢ') },
    { name: 'Superíndice', tags: ['otras'], map: fromStrings('ᵃᵇᶜᵈᵉᶠᵍʰⁱʲᵏˡᵐⁿᵒᵖqʳˢᵗᵘᵛʷˣʸᶻ', 'ᴬᴮᶜᴰᴱᶠᴳᴴᴵᴶᴷᴸᴹᴺᴼᴾQᴿˢᵀᵁⱽᵂˣʸᶻ', '⁰¹²³⁴⁵⁶⁷⁸⁹') },
    { name: 'Al Revés', tags: ['otras'], reverse: true, map: fromStrings('ɐqɔpǝɟƃɥᴉɾʞlɯuodbɹsʇnʌʍxʎz', '∀ꓭƆꓷƎℲ⅁HIſꓘ⅂WNOԀΌꓤSꓕՈΛMX⅄Z', '0ƖᄅƐㄣϛ9ㄥ86') },
    { name: 'Fantasía', tags: ['otras'], map: fromStrings('αႦƈԃҽϝɠԋιʝƙʅɱɳσρϙɾʂƚυʋɯxყȥ') },
    { name: 'Monedas', tags: ['otras'], map: fromStrings('₳฿₵ĐɆ₣₲ⱧłJ₭Ⱡ₥₦Ø₱QⱤ₴₮ɄV₩ӾɎⱫ') },
    { name: 'Tailandesa', tags: ['otras'], map: fromStrings('ค๒ς๔єŦﻮђเןкɭ๓ภ๏קợгรՇยשฬאץչ') },
    { name: 'Griega', tags: ['otras'], map: fromStrings('ΛBᄃDΣFGΉIJKᄂMПӨPQЯƧƬЦVЩXΥZ') },
  ],
};

// Variants applied on top of a base alphabet
const COMBINING = [
  ['Subrayada', '\u0332'], ['Doble Subrayado', '\u0333'], ['Tachada', '\u0336'], ['Barra', '\u0338'],
  ['Línea Superior', '\u0305'], ['Ondulada', '\u0303'], ['Puntos', '\u0324'], ['Ola Inferior', '\u0330'],
];

const WRAPPERS = [
  ['Corazones', '♡ ', ' ♡'], ['Estrellas', '★ ', ' ★'], ['Flores', '✿ ', ' ✿'], ['Real', '꧁ ', ' ꧂'],
  ['Alas', '༺ ', ' ༻'], ['Corchetes', '『', '』'], ['Lenticular', '【', '】'], ['Comillas Dobles', '《', '》'],
  ['Luna', '☾ ', ' ☽'], ['Brillo', '⋆｡°✩ ', ' ✩°｡⋆'], ['Puntitos', '•°• ', ' •°•'], ['Ecualizador', '▁ ▂ ▄ ', ' ▄ ▂ ▁'],
  ['Reina', '♛ ', ' ♛'], ['Flor Blanca', '❀ ', ' ❀'], ['Destello', '✧ ', ' ✧'], ['Pájaro', '𓆩 ', ' 𓆪'],
  ['Música', '♪ ', ' ♪'], ['Estrella Fugaz', '☆彡 ', ' ミ☆'], ['Angulares', '« ', ' »'], ['Mágica', '⊹ ', ' ⊹'],
  ['Amor', '❥ ', ' ❥'], ['Rombo', '✦ ', ' ✦'], ['Ghost', 'ღ ', ' ღ'], ['Guerrero', '꧁༒☬ ', ' ☬༒꧂'],
  ['Doble Corchete', '⟦ ', ' ⟧'], ['Sniper', '▄︻デ ', ' ══━一'], ['Rey', '♔ ', ' ♔'], ['Nube', '☁ ', ' ☁'],
  ['Mariposa', 'ʚ ', ' ɞ'], ['Melodía', '·.¸¸.·♩♪♫ ', ' ♫♪♩·.¸¸.·'], ['Flechas', '⫷ ', ' ⫸'], ['Cita', '❝ ', ' ❞'],
  ['Burbujas Deco', '◦•●◉✿ ', ' ✿◉●•◦'],
];

const SEPARATORS = [
  ['Espaciada', ' '], ['Corazón Entre Letras', '♡'], ['Punto Medio', '·'], ['Estrella Entre Letras', '★'],
  ['Destello Entre Letras', '✧'], ['Asterisco', '⋆'],
];

const VARIANTS = [{ name: '', tags: [] }]
  .concat(COMBINING.map(([name, mark]) => ({ name, mark, tags: [] })))
  .concat(WRAPPERS.map(([name, pre, post]) => ({ name, pre, post, tags: ['decorada'] })))
  .concat(SEPARATORS.map(([name, sep]) => ({ name, sep, tags: ['decorada'] })));

function convert(text, base, variant) {
  let chars = Array.from(normalize(text)).map((c) => base.map[c] || c);
  if (base.reverse) chars.reverse();
  if (variant.mark) chars = chars.map((c) => (c === ' ' || c === '\n' ? c : c + variant.mark));
  let out = chars.join('');
  if (variant.sep) {
    const words = [];
    let cur = [];
    chars.forEach((c) => {
      if (c === ' ') { words.push(cur); cur = []; } else cur.push(c);
    });
    words.push(cur);
    out = words.map((w) => w.join(variant.sep)).join('   ');
  }
  if (variant.pre) out = variant.pre + out + variant.post;
  return out;
}

export function buildStyles(total = 500) {
  const styles = [];
  const add = (base, variant) => {
    styles.push({
      id: styles.length + 1,
      name: variant.name ? `${base.name} · ${variant.name}` : base.name,
      tags: [...new Set([...base.tags, ...variant.tags])],
      convert: (t) => convert(t, base, variant),
    });
  };
  // Plain versions of every base first
  [...BASES.primary, ...BASES.secondary].forEach((b) => add(b, VARIANTS[0]));
  // All variants for the cursive & gothic alphabets
  VARIANTS.slice(1).forEach((v) => BASES.primary.forEach((b) => add(b, v)));
  // Fill the rest with secondary alphabets
  for (const v of VARIANTS.slice(1)) {
    for (const b of BASES.secondary) {
      if (styles.length >= total) return styles;
      add(b, v);
    }
  }
  return styles.slice(0, total);
}
