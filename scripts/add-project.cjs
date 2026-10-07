const fs = require('node:fs');
const path = require('node:path');
const readline = require('node:readline/promises');
const { randomUUID } = require('node:crypto');
const { spawnSync } = require('node:child_process');
const { validDate, validateProjects, groupProjectSections } = require('./projects.cjs');
const root = path.resolve(__dirname, '..');
const target = path.join(root, 'src/data/projects.json');

async function main() {
  const original = fs.readFileSync(target, 'utf8');
  const projects = JSON.parse(original);
  validateProjects(projects);
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  rl.on('SIGINT', () => { console.log('\n취소했습니다. 변경 사항이 없습니다.'); process.exit(0); });
  async function ask(label, fallback = '', valid = value => !!value) {
    for (;;) {
      const answer = (await rl.question(`${label}${fallback ? ` [Enter: ${fallback}]` : ''}: `)).trim() || fallback;
      if (valid(answer)) return answer;
      console.log('입력값을 확인해주세요.');
    }
  }
  let project;
  try {
    console.log('\n새 연구과제 추가 — 취소하려면 Ctrl+C\n');
    const title = await ask('과제 제목 (영문)');
    const subtitle = await ask('부제 / 약어 (없으면 Enter)', '', () => true);
    const projectId = await ask('Project ID', '', value => {
      if (projects.some(p => p.projectId.toLowerCase() === value.toLowerCase())) {
        console.log('이미 등록된 Project ID입니다.'); return false;
      }
      return !!value;
    });
    const investigator = await ask('Principal Investigator', 'Hyun Ae Jung');
    const institution = await ask('Institution', 'Samsung Medical Center');
    const agency = await ask('Funding Agency');
    const program = await ask('Program');
    const startDate = await ask('시작일 (YYYY-MM-DD)', '', validDate);
    const endDate = await ask('종료일 (YYYY-MM-DD)', '', value => validDate(value) && value >= startDate);
    const funding = await ask('Total Research Funding (예: KRW 100 million)');
    project = { key: randomUUID(), title, subtitle, projectId, investigator, institution, agency, program, startDate, endDate, funding };
    validateProjects([...projects, project]);
    console.log('\n입력 내용 확인');
    for (const [label, value] of Object.entries(project)) if (label !== 'key') console.log(`${label}: ${value || '—'}`);
    console.log(`표시 연도: ${startDate.slice(0, 4)}`);
    const confirm = await ask('추가하고 빌드할까요? (y/N)', 'N', value => /^(y|n)$/i.test(value));
    if (confirm.toLowerCase() !== 'y') { console.log('취소했습니다. 변경 사항이 없습니다.'); return; }
  } finally { rl.close(); }

  // Detect concurrent edits before replacing the data; preview rendering first.
  if (fs.readFileSync(target, 'utf8') !== original) throw new Error('입력 중 데이터가 변경되었습니다. 다시 실행해주세요.');
  const updated = [...projects, project];
  const nunjucks = require('nunjucks');
  const env = new nunjucks.Environment(new nunjucks.FileSystemLoader(path.join(root, 'src')), { autoescape: true, throwOnUndefined: true });
  env.render('_includes/project-list.njk', { projectSections: groupProjectSections(updated) });
  const temp = `${target}.tmp`;
  fs.writeFileSync(temp, JSON.stringify(updated, null, 2) + '\n', { encoding: 'utf8', flag: 'wx' });
  fs.renameSync(temp, target);
  const result = spawnSync(process.execPath, [path.join(__dirname, 'build.cjs')], { cwd: root, stdio: 'inherit' });
  if (result.error || result.status !== 0) {
    fs.writeFileSync(target, original, 'utf8');
    throw new Error('빌드에 실패하여 과제 데이터를 원래대로 복원했습니다. 오류를 해결한 뒤 다시 실행해주세요.');
  }
  console.log('\n과제 추가와 빌드가 완료되었습니다. projects.html을 새로고침하세요.');
  console.log('GitHub 업로드는 별도로 진행해주세요.');
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
