const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..', 'packages', 'knowledge-data', 'src');
const specs = [
  ['plants', 'plant-'], ['articles', 'art-'], ['skills', 'skill-'],
  ['supplies', 'sup-'], ['animals', 'animal-'], ['animals', 'track-'],
  ['firstAid', 'fa-'], ['medicines', 'med-'], ['scenarios', 'scn-'],
  ['hazards', 'hz-'], ['insects', 'insect-'], ['quizzes', 'qz-'],
];
for (const [f, pre] of specs) {
  try {
    const c = fs.readFileSync(path.join(dir, f + '.ts'), 'utf8');
    const n = (c.match(new RegExp("id: '" + pre, 'g')) || []).length;
    console.log((f + ' (' + pre + ')').padEnd(22), n, 'entries,', c.split('\n').length, 'lines');
  } catch (e) {
    console.log(f, 'ERROR', e.message);
  }
}
