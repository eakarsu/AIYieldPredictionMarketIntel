import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import AIYieldPrediction from './AIYieldPrediction';
import AIMarketTrendForecast from './AIMarketTrendForecast';
import AIPestOutbreakPrediction from './AIPestOutbreakPrediction';
import AIIrrigationOptimize from './AIIrrigationOptimize';
import AISoilAmendment from './AISoilAmendment';
import AIEquipmentMaintenance from './AIEquipmentMaintenance';
import AIReport from '../components/AIReport';
import Login from './Login';
import * as api from '../services/api';

jest.mock('../services/api', () => ({
  login: jest.fn(), aiYieldPrediction: jest.fn(), aiMarketTrendForecast: jest.fn(),
  aiPestOutbreakPrediction: jest.fn(), aiIrrigationOptimize: jest.fn(),
  aiSoilAmendment: jest.fn(), aiEquipmentMaintenance: jest.fn(),
}));
jest.mock('react-toastify', () => ({ toast: { error: jest.fn(), success: jest.fn() } }));
global.IS_REACT_ACT_ENVIRONMENT = true;

async function mount(element) {
  const container = document.createElement('div');
  const root = createRoot(container);
  await act(async () => root.render(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>{element}</MemoryRouter>));
  return { container, root };
}

test.each([
  ['yield', AIYieldPrediction], ['market', AIMarketTrendForecast],
  ['pest', AIPestOutbreakPrediction], ['irrigation', AIIrrigationOptimize],
  ['soil', AISoilAmendment], ['equipment', AIEquipmentMaintenance],
])('%s presets fill every native form field without generation', async (_, Page) => {
  const { container, root } = await mount(<Page onLogout={() => {}} />);
  const buttons = [...container.querySelectorAll('.ai-preset-bar button')];
  expect(buttons).toHaveLength(3);
  for (const button of buttons) {
    await act(async () => button.dispatchEvent(new MouseEvent('click', { bubbles: true })));
    const fields = [...container.querySelectorAll('form input, form textarea, form select')];
    expect(fields.length).toBeGreaterThan(0);
    expect(fields.every((field) => field.value !== '')).toBe(true);
  }
  for (const mock of Object.values(api).filter(jest.isMockFunction)) expect(mock).not.toHaveBeenCalled();
  await act(async () => root.unmount());
});

test('returned and saved JSON render labeled facts, table, false, zero, and empty string', async () => {
  const result = { summary: { approved: false, count: 0, note: '' }, observations: [{ crop: 'Corn', risk: 'Low' }, { crop: 'Wheat', risk: 'High' }] };
  for (const response of [result, { result_json: result }]) {
    const { container, root } = await mount(<AIReport response={response} />);
    expect(container.textContent).toContain('Summary');
    expect(container.textContent).toContain('Approved');
    expect(container.textContent).toContain('No');
    expect(container.textContent).toContain('0');
    expect(container.textContent).toContain('Note');
    expect(container.textContent).toContain('Empty string');
    expect(container.querySelectorAll('tbody tr')).toHaveLength(2);
    expect(container.textContent).not.toContain('{"summary"');
    await act(async () => root.unmount());
  }
});

test('demo fill needs configuration and never submits', async () => {
  const originalEmail = process.env.REACT_APP_DEMO_EMAIL;
  const originalPassword = process.env.REACT_APP_DEMO_PASSWORD;
  delete process.env.REACT_APP_DEMO_EMAIL;
  delete process.env.REACT_APP_DEMO_PASSWORD;
  const absent = await mount(<Login onLogin={() => {}} />);
  expect(absent.container.querySelector('.btn-fill').disabled).toBe(true);
  await act(async () => absent.root.unmount());
  process.env.REACT_APP_DEMO_EMAIL = 'configured@example.test';
  process.env.REACT_APP_DEMO_PASSWORD = 'fixture-only';
  const configured = await mount(<Login onLogin={() => {}} />);
  await act(async () => configured.container.querySelector('.btn-fill').dispatchEvent(new MouseEvent('click', { bubbles: true })));
  expect(configured.container.querySelector('input[type=email]').value).toBe('configured@example.test');
  expect(configured.container.querySelector('input[type=password]').value).toBe('fixture-only');
  expect(api.login).not.toHaveBeenCalled();
  await act(async () => configured.root.unmount());
  if (originalEmail === undefined) delete process.env.REACT_APP_DEMO_EMAIL; else process.env.REACT_APP_DEMO_EMAIL = originalEmail;
  if (originalPassword === undefined) delete process.env.REACT_APP_DEMO_PASSWORD; else process.env.REACT_APP_DEMO_PASSWORD = originalPassword;
});
