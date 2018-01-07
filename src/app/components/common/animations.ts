import {
  animate,
  // animateChild,
  // query,
  // stagger,
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

export const myWizardAnimation = trigger(
  'myWizardAnimation',
  [
    transition(
      ':leave', [
        style({ transform: 'translateX(0)', 'opacity': 1 }),
        animate('250ms 900ms ease-in', style({ transform: 'translateY(15%)', 'opacity': 0 }))
      ]
    )
  ]
);

// export const parentAnimation = trigger('parentAnimation', [
//   transition(':enter', [style({ opacity: 0 }), animate('.6s ease')])
// ]);

// export const childAnimation = trigger('childAnimation', [
//   transition(':enter', [
//     query(':enter', stagger('.9s', [animateChild()]))
//   ])
// ]);
