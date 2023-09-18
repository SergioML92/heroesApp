import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Hero, Publisher } from '../../interfaces/hero.interface';
import { HeroesServices } from '../../services/heroes.services';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, switchMap, tap } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-new-page',
  templateUrl: './new-page.component.html',
  styles: [
  ]
})
export class NewPageComponent implements OnInit {

  public heroForm = new FormGroup({
    id:               new FormControl<string>(''),
    superhero:        new FormControl<string>('', { nonNullable: true }),
    publisher:        new FormControl<Publisher>(Publisher.DCComics),
    alter_ego:        new FormControl<string>(''),
    first_appearance: new FormControl<string>(''),
    characters:       new FormControl<string>(''),
    alt_img:          new FormControl<string>(''),
  });

  public publishers = [
    { id: 'DC Comics', desc: 'DC - Comics' },
    { id: 'Marvel Comics', desc: 'Marvel - Comics' }
  ];

  constructor(
    private heroesServices: HeroesServices,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private snackbar: MatSnackBar,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    if (!this.router.url.includes('edit')) return;

    this.activatedRoute.params
      .pipe(
        switchMap( ({id}) => this.heroesServices.getHeroById(id)),
      ).subscribe( hero => {
        if (!hero) {
          return this.router.navigateByUrl('/');
        }
        this.heroForm.reset(hero);
        return;
      });
  }

  get currentHero():Hero {
    const hero = this.heroForm.value as Hero;
    return hero;
  }

  onSubmit():void {
    console.log({
      formIsValid: this.heroForm.valid,
      value: this.heroForm.value
    });

    if (this.heroForm.invalid) return;

    if (this.currentHero.id) {
      this.heroesServices.updateHero(this.currentHero)
        .subscribe( hero => {
          // TODO Mostrar snackbar
          this.showSnackbar(`${hero.superhero} updated!`);
        });
      return;
    }

    this.heroesServices.addHero(this.currentHero)
      .subscribe(hero => {
        // TODO Mostrar snackbar, y navegar a /heroes/edit/ hero.id
        this.router.navigate(['/heroes/edit', hero.id]);
        this.showSnackbar(`${hero.superhero} created!`);
      });
  }

  onDeleteHero():void {
    if (!this.currentHero.id) {
      throw Error('Hero id is required');
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: this.heroForm.value,
    });

    dialogRef.afterClosed()
      .pipe(
        filter( (result: boolean) => result),
        switchMap(() => this.heroesServices.deleteHeroById( this.currentHero.id)),
        filter( (wasDeleted: boolean) => wasDeleted),
        tap( wasDeleted => console.log(wasDeleted))
      )
      .subscribe(result => {
        console.log({result});
        this.router.navigate(['/heroes']);
      });


/*    dialogRef.afterClosed().subscribe(result => {

      if (!result) return;

      this.heroesServices.deleteHeroById( this.currentHero.id )
        .subscribe( wasDeleted => {
          if (wasDeleted)
            this.router.navigate(['/heroes']);
        });

      console.log('Deleted');
    });*/
  }

  showSnackbar( message: string ):void {
    this.snackbar.open( message, 'done', {
      duration: 2500
    } );
  }

}
