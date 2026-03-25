import { bootstrapApplication } from '@angular/platform-browser';
import { registerLocaleData } from '@angular/common';
import localeEsPE from '@angular/common/locales/es-PE';
import { appConfig } from './app/app.config';
import { App } from './app/app';

registerLocaleData(localeEsPE);

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
