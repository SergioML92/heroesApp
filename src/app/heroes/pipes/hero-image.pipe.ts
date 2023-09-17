import { Pipe, PipeTransform } from '@angular/core';
import { Hero } from '../interfaces/hero.interface';

@Pipe({
  name: 'heroImage'
})
export class HeroImagePipe implements PipeTransform {

  transform(hero: Hero): string {

    if (hero.id) {
      return `assets/heroes/${hero.id}.jpg`;
    } else if (hero.alt_img) {
      return hero.alt_img;
    } else {
      return 'assets/no-image.png';
    }
  }
}
