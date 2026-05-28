import { Given, When, Then } from 'vitest-cucumber-plugin';
import { expect } from 'vitest';
import { createApp, nextTick } from 'vue';
import { setActivePinia, createPinia } from 'pinia';
import App from '../../src/App.vue';

let appInstance: any = null;
let container: HTMLDivElement | null = null;

Given('a mounted application', async (state: any) => {
  setActivePinia(createPinia());
  
  container = document.createElement('div');
  document.body.appendChild(container);
  
  appInstance = createApp(App);
  appInstance.mount(container);
  await nextTick();
  
  return { ...state, container };
});

Then('the Device Panel should be open by default', async (state: any) => {
  const panel = container?.querySelector('.border-t.transition-all') as HTMLElement;
  expect(panel).not.toBeNull();
  expect(panel.className).toContain('h-52');
  return state;
});

When('I click the Device Panel header', async (state: any) => {
  const header = container?.querySelector('.cursor-pointer.h-8') as HTMLElement;
  expect(header).not.toBeNull();
  header.click();
  await nextTick();
  return state;
});

Then('the Device Panel should indicate it is collapsed', async (state: any) => {
  const panel = container?.querySelector('.border-t.transition-all') as HTMLElement;
  expect(panel.className).toContain('h-8');
  expect(panel.className).not.toContain('h-52');
  return state;
});

When('I click the Device Panel header again', async (state: any) => {
  const header = container?.querySelector('.cursor-pointer.h-8') as HTMLElement;
  expect(header).not.toBeNull();
  header.click();
  await nextTick();
  return state;
});

Then('the Device Panel should indicate it is expanded', async (state: any) => {
  const panel = container?.querySelector('.border-t.transition-all') as HTMLElement;
  expect(panel.className).toContain('h-52');
  expect(panel.className).not.toContain('h-8');
  
  // Limpiar recursos al finalizar
  if (appInstance) {
    appInstance.unmount();
    appInstance = null;
  }
  if (container) {
    container.remove();
    container = null;
  }
  
  return state;
});
