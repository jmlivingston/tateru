import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';

@Component({
  selector: 'storybook-root',
  standalone: true,
  template: '',
})
class StorybookHostComponent {}

bootstrapApplication(StorybookHostComponent).catch((error: unknown) => {
  console.error(error);
});
