import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import FeaturePage, { listRows } from './FeaturePage';
import { getItems } from '../services/api';
import fs from 'fs';
import path from 'path';
import vm from 'vm';

jest.mock('../services/api', () => ({ getItems: jest.fn() }));
jest.mock('react-toastify', () => ({ toast: { error: jest.fn(), success: jest.fn() } }));
global.IS_REACT_ACT_ENVIRONMENT = true;

const source = fs.readFileSync(path.resolve(__dirname, '../../../backend/src/seeds/index.js'), 'utf8');
const seedLiteral = source.split('const seedData = ')[1].split('\n};')[0] + '\n}';
const seedData = vm.runInNewContext(`(${seedLiteral})`);
const rows = seedData.YieldPrediction.map((row, index) => ({ ...row, id: index + 1 }));
const feature = { key: 'yield-predictions', name: 'Yield Predictions', icon: '📊', fields: ['farm_name', 'crop_type'] };

test.each([
  ['standard', { success: true, data: rows, count: 15 }],
  ['paginated', { data: { data: rows, pagination: { total: 15 } } }],
])('%s list response renders 15 records without a runtime error', async (_, payload) => {
  getItems.mockResolvedValue({ data: payload });
  const errors = jest.spyOn(console, 'error').mockImplementation(() => {});
  const container = document.createElement('div');
  const root = createRoot(container);
  await act(async () => { root.render(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><FeaturePage feature={feature} onLogout={() => {}} /></MemoryRouter>); });
  expect(container.querySelectorAll('tbody tr')).toHaveLength(15);
  expect(errors).not.toHaveBeenCalled();
  await act(async () => root.unmount());
  errors.mockRestore();
});

test.each(Object.entries(seedData))('%s shared list renders at least 15 project seed records', async (model, records) => {
  expect(records.length).toBeGreaterThanOrEqual(15);
  getItems.mockResolvedValue({ data: { success: true, data: records.map((row, index) => ({ ...row, id: index + 1 })) } });
  const errors = jest.spyOn(console, 'error').mockImplementation(() => {});
  const container = document.createElement('div');
  const root = createRoot(container);
  const namedFeature = { key: model, name: model, icon: '📊', fields: Object.keys(records[0]).slice(0, 5) };
  await act(async () => root.render(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><FeaturePage feature={namedFeature} onLogout={() => {}} /></MemoryRouter>));
  expect(container.querySelectorAll('tbody tr').length).toBeGreaterThanOrEqual(15);
  expect(errors).not.toHaveBeenCalled();
  await act(async () => root.unmount());
  errors.mockRestore();
});

test('non-array payload is reported as a load error before rendering rows', async () => {
  const malformed = { data: { pagination: { total: 0 } } };
  expect(() => listRows(malformed)).toThrow('does not contain records');
  getItems.mockResolvedValue({ data: malformed });
  const container = document.createElement('div');
  const root = createRoot(container);
  await act(async () => root.render(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><FeaturePage feature={feature} onLogout={() => {}} /></MemoryRouter>));
  expect(container.querySelector('[role=alert]').textContent).toContain('Unable to load records');
  expect(container.querySelectorAll('tbody tr')).toHaveLength(0);
  await act(async () => root.unmount());
});
