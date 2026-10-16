import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { app } from './app.js';

let server, base;
before(async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/taskmanager_test');
  await mongoose.connection.dropDatabase();
  server = app.listen(0);
  base = `http://localhost:${server.address().port}/api/tasks`;
});
after(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  server.close();
});

const j = (path, method = 'GET', body) =>
  fetch(base + path, { method, headers: { 'content-type': 'application/json' }, body: body && JSON.stringify(body) });

test('create, update, filter, delete', async () => {
  let r = await j('', 'POST', { title: 'Write tests', priority: 'high' });
  assert.equal(r.status, 201);
  const t = await r.json();
  assert.equal(t.status, 'todo');

  r = await j(`/${t._id}`, 'PATCH', { status: 'done' });
  assert.equal((await r.json()).status, 'done');

  r = await j('?status=done');
  assert.equal((await r.json()).items.length, 1);
  r = await j('?status=todo');
  assert.equal((await r.json()).items.length, 0);

  r = await j(`/${t._id}`, 'DELETE');
  assert.equal(r.status, 204);
  r = await j(`/${t._id}`, 'DELETE');
  assert.equal(r.status, 404);
});

test('validation', async () => {
  assert.equal((await j('', 'POST', { title: '   ' })).status, 400);
  assert.equal((await j('', 'POST', { title: 'x', status: 'bogus' })).status, 400);
  assert.equal((await j('/not-an-id', 'PATCH', { title: 'x' })).status, 400);
});

test('page pagination', async () => {
  for (let i = 1; i <= 5; i++) await j('', 'POST', { title: `page ${i}` });
  let r = await (await j('?limit=2&page=1')).json();
  assert.deepEqual(r.items.map((t) => t.title), ['page 5', 'page 4']);
  assert.equal(r.total, 5);
  assert.equal(r.pages, 3);
  r = await (await j('?limit=2&page=3')).json();
  assert.deepEqual(r.items.map((t) => t.title), ['page 1']);
  r = await (await j('?limit=2&page=99')).json(); // out of range is clamped to the last page
  assert.equal(r.page, 3);
  r = await (await j('?limit=2&page=abc')).json();
  assert.equal(r.page, 1);
});
