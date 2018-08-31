import { Injectable } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import { AngularFireAuth } from 'angularfire2/auth';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import 'rxjs/add/operator/map';
import { Store } from '@ngrx/store';
import { Exercise } from './exercise.model';
import { UIService } from '../shared/ui.service';
import * as UI from '../shared/ui.actions';
import * as Training from './training.actions';
import * as fromTraining from './training.reducer';

@Injectable()
export class TrainingService {
  private firebaseSubs: Subscription[] = [];
  private currentUID: string;

  constructor(
    private db: AngularFirestore,
    private uiService: UIService,
    private afAuth: AngularFireAuth,
    private store: Store<fromTraining.State>
  ) {
  }

  private getCurrentUserUID() {
    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.currentUID = user.uid;
        // console.log(this.currentUID);
      }
    });
  }

  fetchAvailableExercises() {
    this.store.dispatch(new UI.StartLoading());
    this.firebaseSubs.push(
      this.db
        .collection('availableExercises')
        .snapshotChanges()
        .map(docArray => {
          return docArray.map(doc => {
            return {
              id: doc.payload.doc.id,
              name: doc.payload.doc.data()['name'],
              duration: doc.payload.doc.data()['duration'],
              calories: doc.payload.doc.data()['calories']
            };
          });
        })
        .subscribe(
          (exercises: Exercise[]) => {
            this.store.dispatch(new UI.StopLoading());
            this.store.dispatch(new Training.SetAvailableTrainings(exercises));
          },
          error => {
            this.store.dispatch(new UI.StopLoading());
            this.uiService.showSnackbar(
              'Fetching Exercises failed, please try again later',
              null,
              3000
            );
          }
        )
    );
  }

  startExercise(selectedId: string) {
    this.store.dispatch(new Training.StartTraining(selectedId));
  }

  async completeExercise() {
    await this.getCurrentUserUID();
    this.store.select(fromTraining.getActiveTraining).pipe(take(1)).subscribe(ex => {
      this.addDataToDatabase({
        ...ex,
        uid: this.currentUID,
        date: new Date(),
        state: 'completed'
      });
      this.store.dispatch(new Training.StopTraining());
    });
  }

  async cancelExercise(progress: number) {
    await this.getCurrentUserUID();
    this.store.select(fromTraining.getActiveTraining).pipe(take(1)).subscribe(ex => {
      this.addDataToDatabase({
        ...ex,
        uid: this.currentUID,
        duration: ex.duration * (progress / 100),
        calories: ex.calories * (progress / 100),
        date: new Date(),
        state: 'cancelled'
      });
      this.store.dispatch(new Training.StopTraining());
    });
  }

  async fetchCompletedOrCancelledExercises() {
    await this.getCurrentUserUID();
    this.firebaseSubs.push(
      this.db
        .collection('finishedExercises', ref => ref.where('uid', '==', this.currentUID))
        .valueChanges()
        .subscribe((exercises: Exercise[]) => {
          this.store.dispatch(new Training.SetFinishedTrainings(exercises));
        })
    );
  }

  cancelSubscriptions() {
    this.firebaseSubs.forEach(sub => sub.unsubscribe());
  }

  private addDataToDatabase(exercise: Exercise) {
    this.db.collection('finishedExercises').add(exercise);
  }
}
