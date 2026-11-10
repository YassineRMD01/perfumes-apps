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
 * Lumora theme: Aura with warm neutral surfaces. The primary palette is replaced at runtime
 * with the accent color chosen in the admin settings (SettingsService → updatePrimaryPalette).
 */
const LumoraPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#fcf4f3', 100: '#f9ebea', 200: '#f1d8d7', 300: '#e7bebc', 400: '#db9e9a', 500: '#cf7d78',
      600: '#b26a66', 700: '#925754', 800: '#744544', 900: '#5d3836', 950: '#432827',
    },
    formField: { borderRadius: '0.85rem' },
    colorScheme: {
      light: {
        primary: { color: '{primary.600}', contrastColor: '#ffffff', hoverColor: '{primary.700}', activeColor: '{primary.800}' },
        highlight: { background: '{primary.50}', focusBackground: '{primary.100}', color: '{primary.700}', focusColor: '{primary.800}' },
        surface: {
          0: '#ffffff', 50: '#fbf8f5', 100: '#f7f1ed', 200: '#ece2dc', 300: '#ddd0c8', 400: '#bfaea5', 500: '#9c8a81',
          600: '#7a6a62', 700: '#5c4f49', 800: '#3e3431', 900: '#2d2523', 950: '#1a1514',
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
          0: '#ffffff', 50: '#f6f1ee', 100: '#ebe3df', 200: '#d6cbc5', 300: '#baaca5', 400: '#86786f', 500: '#6c5e59',
          600: '#4f4243', 700: '#382d2e', 800: '#251e1f', 900: '#1c1617', 950: '#141011',
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
