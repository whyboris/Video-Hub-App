import {
  animate,
  state,
  style,
  transition,
  trigger
} from '@angular/animations';

export const myAnimation = trigger(
  'myAnimation',
  [
    transition(
      ':enter', [
        style({ transform: 'translateY(15%)', opacity: 0 }),
        animate('250ms ease-out', style({ transform: 'translateY(0)', 'opacity': 1 }))
      ]
    ),
    transition(
      ':leave', [
        style({ transform: 'translateX(0)', 'opacity': 1 }),
        animate('250ms ease-in', style({ transform: 'translateY(15%)', 'opacity': 0 }))
      ]
    )
  ]
);

export const myAnimation2 = trigger(
  'myAnimation2',
  [
    transition(
      ':enter', [
        style({ transform: 'translateY(15%)', opacity: 0 }),
        animate('250ms ease-out', style({ transform: 'translateY(0)', 'opacity': 1 }))
      ]
    )
  ]
);
