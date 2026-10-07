import test from 'node:test';
import assert from 'node:assert/strict';
import { featuredProjects, nextProject, normalizeProject, projectPath, safeExternalUrl } from '../src/lib/content';

test('legacy records keep stable routes after renaming and accept editorial slugs', () => {
  const original = normalizeProject({ _id: 'id-a', name: 'One' });
  const renamed = normalizeProject({ _id: 'id-a', name: 'Two' });
  assert.equal(projectPath(original), projectPath(renamed));
  assert.equal(normalizeProject({ _id: 'id-a', slug: 'chosen-name' }).slug, 'chosen-name');
  assert.equal(projectPath({ slug: 'a/b' }), '/work/a%2Fb');
});
test('curated projects retain editorial order and skip missing references', () => {
  const projects = [normalizeProject({ _id: 'a', featured: false }), normalizeProject({ _id: 'b' }), normalizeProject({ _id: 'c' })];
  assert.deepEqual(featuredProjects(projects, {}).map(p => p._id), ['b', 'c']);
  assert.deepEqual(featuredProjects(projects, { featuredProjects: [{ _id: 'c' }, { _id: 'missing' }, { _id: 'a' }] }).map(p => p._id), ['c', 'a']);
});
test('related navigation avoids self references and cycles safely', () => {
  const a = normalizeProject({ _id: 'a', relatedProjects: [{ _id: 'a' }, { _id: 'c' }] });
  const b = normalizeProject({ _id: 'b' });
  const c = normalizeProject({ _id: 'c' });
  assert.equal(nextProject(a, [a, b, c])?._id, 'c');
  assert.equal(nextProject(c, [a, b, c])?._id, 'a');
  assert.equal(nextProject(a, [a]), undefined);
});
test('external CMS links reject executable and malformed schemes', () => {
  for (const value of ['javascript:alert(1)', 'data:text/html,test', '/relative', 'bad url']) assert.equal(safeExternalUrl(value), undefined);
  assert.equal(safeExternalUrl('https://example.com/project'), 'https://example.com/project');
});
