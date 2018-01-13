import { animate, state, style, transition, trigger } from '@angular/animations';

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

export const topAnimation = trigger(
  'topAnimation',
  [
    transition(
      ':enter', [
        style({ height: '0'}),
        animate('300ms ease-out', style({ height: '45px' }))
      ]
    ),
    transition(
      ':leave', [
        style({ height: '45px'}),
        animate('300ms ease-in', style({ height: '0px' }))
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

export const galleryItemAppear = trigger(
  'galleryItemAppear',
  [
    transition(
      ':enter', [
        style({ filter: 'opacity(0)' }),
        animate('300ms ease-out', style({}))
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

