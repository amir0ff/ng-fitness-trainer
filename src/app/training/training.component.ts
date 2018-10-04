import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { UIService } from '../shared/ui.service';

import { TrainingService } from './training.service';
import * as fromTraining from './training.reducer';

@Component({
  selector: 'app-training',
  templateUrl: './training.component.html',
  styleUrls: ['./training.component.css']
})
export class TrainingComponent implements OnInit {
  ongoingTraining$: Observable<boolean>;

  constructor(private trainingService: TrainingService, private store: Store<fromTraining.State>, private uiService: UIService) {
  }

  ngOnInit() {
    this.ongoingTraining$ = this.store.select(fromTraining.getIsTraining);
    this.isUserIdle();
  }

  isUserIdle() {
    let timeout;
    const showSnackbar = () => {
      this.uiService.showSnackbar('Please remember to save your work!', null, 6000);
    };

    // Fires when the mouse pointer moves out of the window
    window.onmouseout = () => {
      timeout = setTimeout(showSnackbar, 6000);
    };

    // Fires when the mouse pointer moves over the window
    window.onmouseover = () => {
      this.uiService.closeSnackbar();
      clearTimeout(timeout);
    };

  }
}
