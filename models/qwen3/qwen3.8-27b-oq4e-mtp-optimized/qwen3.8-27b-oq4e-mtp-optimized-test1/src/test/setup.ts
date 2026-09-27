import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';
import { setClock } from '../lib/clock';

// jsdom kennt die Browser-UA-Styles für <dialog> nicht: geschlossene Dialoge
// wären sonst im Accessibility-Tree "sichtbar" und RTL-Querien würden sie
// finden. Regel entspricht dem echten UA-Verhalten.
const style = document.createElement('style');
style.textContent = 'dialog:not([open]) { display: none; }';
document.head.appendChild(style);

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  window.location.hash = '';
  setClock(null);
});

// jsdom hat <dialog> nur teilweise implementiert: showModal/hasFocus fehlen je
// nach Version. Minimalpolyfill, damit die App-Komponente portabel läuft.
if (typeof HTMLDialogElement !== 'undefined') {
  const proto = HTMLDialogElement.prototype as HTMLDialogElement & {
    showModal?: unknown;
    close?: unknown;
  };
  if (typeof proto.showModal !== 'function') {
    proto.showModal = function () {
      this.open = true;
    };
  }
  if (typeof proto.close !== 'function') {
    proto.close = function () {
      this.open = false;
      this.dispatchEvent(new Event('close'));
    };
  }
}
