import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import {
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling,
  TitleStrategy,
} from '@angular/router';
import { I18nTitleStrategy } from './core/i18n/title-strategy';
import { providePrimeNG } from 'primeng/config';
import { ConfirmationService, MessageService } from 'primeng/api';
import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';
import { routes } from './app.routes';

/**
 * Lumora theme: Aura with white (light) / black (dark) surfaces and a gold accent. The primary palette is replaced at runtime
 * with the accent color chosen in the admin settings (SettingsService → updatePrimaryPalette).
 */
const LumoraPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#fbf8f3', 100: '#f6f1e4', 200: '#eee2ca', 300: '#e2d0a6', 400: '#d4b87a', 500: '#c5a04e',
      600: '#a98944', 700: '#8c703a', 800: '#6e582f', 900: '#584527', 950: '#3e301e',
    },
    formField: { borderRadius: '0.85rem' },
    colorScheme: {
      light: {
        // darker gold on white keeps button text readable
        primary: { color: '{primary.700}', contrastColor: '#ffffff', hoverColor: '{primary.800}', activeColor: '{primary.900}' },
        highlight: { background: '{primary.50}', focusBackground: '{primary.100}', color: '{primary.700}', focusColor: '{primary.800}' },
        surface: {
          0: '#ffffff', 50: '#fcfbf8', 100: '#f6f4ef', 200: '#e9e5dc', 300: '#d8d3c8', 400: '#b6b0a4', 500: '#8f897e',
          600: '#69645c', 700: '#4d4943', 800: '#2f2d29', 900: '#141311', 950: '#0a0a09',
        },
      },
      dark: {
        primary: { color: '{primary.400}', contrastColor: '{surface.950}', hoverColor: '{primary.300}', activeColor: '{primary.200}' },
        highlight: {
          background: 'color-mix(in srgb, {primary.400}, transparent 84%)',
          focusBackground: 'color-mix(in srgb, {primary.400}, transparent 76%)',
          color: 'rgba(255,255,255,.87)',
          focusColor: 'rgba(255,255,255,.87)',
        },
        surface: {
          0: '#ffffff', 50: '#f6f2ea', 100: '#e9e4da', 200: '#d2ccc1', 300: '#b5afa4', 400: '#7d786f', 500: '#5e5a53',
          600: '#43403b', 700: '#2b2a27', 800: '#1a1a19', 900: '#121212', 950: '#0a0a0a',
        },
      },
    },
  },
  components: {
    button: { root: { borderRadius: '999px', paddingX: '1.1rem' } },
    tag: { root: { borderRadius: '999px' } },
    dialog: { root: { borderRadius: '1.5rem' } },
  },
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({ scrollPositionRestoration: 'top' }),
    ),
    providePrimeNG({
      ripple: true,
      theme: {
        preset: LumoraPreset,
        options: {
          darkModeSelector: '.app-dark',
          cssLayer: { name: 'primeng', order: 'theme, base, primeng, components, utilities' },
        },
      },
    }),
    { provide: TitleStrategy, useClass: I18nTitleStrategy },
    MessageService,
    ConfirmationService,
  ],
};
