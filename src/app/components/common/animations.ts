import { animate, state, style, transition, trigger } from '@angular/animations';

export const modalAnimation = trigger('modalAnimation', [
  transition(
    ':enter', [
      style({ transform: 'translateY(10px)', opacity: 0 }),
      animate('250ms ease-in', style({ transform: 'translateY(0)', opacity: 1 }))
    ]
  ),
  transition(
    ':leave', [
      style({ transform: 'translateX(0)', 'opacity': 1 }),
      animate('250ms ease-out', style({ transform: 'translateY(10px)', opacity: 0 }))
    ]
  )]
);

export const rightClickAnimation = trigger('rightClickAnimation', [
  transition(
    ':leave', [
      style({ transform: 'translateX(0)', 'opacity': 1 }),
      animate('250ms cubic-bezier(0,.7,.67,1)', style({ transform: 'translateY(10px)', opacity: 0 }))
    ]
  )]
);

export const rightClickContentAnimation = trigger('rightClickContentAnimation', [
  transition(
    ':enter', [
      style({ 'margin-bottom': -60 }),
      animate('150ms cubic-bezier(0,1.11,1,1.15)', style({ 'margin-bottom': 0 }))
    ]
  )]
);

export const topAnimation = trigger('topAnimation', [
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
  )]
);

export const galleryItemAppear = trigger('galleryItemAppear', [
  transition(
    ':enter', [
      style({ opacity: 0 }),
      animate('300ms ease-out', style({}))
    ]
  )]
);

export const metaAppear = trigger('metaAppear', [
  transition(
    ':enter', [
      style({ opacity: 0 }),
      animate('100ms ease-in', style({ opacity: 1 }))
    ]
  ),
  transition(
    ':leave', [
      style({ opacity: 1 }),
      animate('100ms ease-out', style({ opacity: 0 }))
    ]
  )]
);

export const overlayAppear = trigger('overlayAppear', [
  transition(
    ':enter', [
      style({ opacity: 0 }),
      animate('1000ms ease-in', style({ opacity: 1 }))
    ]
  ),
  transition(
    ':leave', [
      style({ opacity: 1 }),
      animate('100ms ease-out', style({ opacity: 0 }))
    ]
  )]
);

export const donutAppear = trigger('donutAppear', [
  transition(
    ':enter', [
      style({ opacity: 0, transform: 'translateX(40px)' }),
      animate('250ms cubic-bezier(.2,1.05,.79,1.26)', style({ opacity: 1, transform: 'translateX(0)' }))
    ]
  ),
  transition(
    ':leave', [
      style({ opacity: 1, transform: 'translateX(0)' }),
      animate('250ms ease-in', style({ opacity: 0, transform: 'translateX(40px)' }))
    ]
  )]
);

export const textAppear = trigger('textAppear', [
  transition(
    ':enter', [
      style({ opacity: 0, transform: 'translateY(-15px)' }),
      animate('300ms ease-in', style({ opacity: 1, transform: 'translateY(0)' }))
    ]
  ),
  transition(
    ':leave', [
      style({ opacity: 1, transform: 'translateY(0)' }),
      animate('300ms ease-out', style({ opacity: 0, transform: 'translateY(-15px)' }))
    ]
  )]
);

export const filterItemAppear = trigger('filterItemAppear', [
  transition(
    ':enter', [
      style({ height: 0, opacity: 0 }),
      animate('300ms ease-in', style({ height: '64px', opacity: 1 }))
    ]
  ),
  transition(
    ':leave', [
      style({ height: '64px', opacity: 1 }),
      animate('300ms ease-out', style({ height: 0, opacity: 0 }))
    ]
  )]
);

export const tagDeleteButton = trigger('tagDeleteButton', [
  transition(
    ':enter', [
      style({ opacity: 0, transform: 'translate(0, 1px)' }),
      animate('300ms ease-in', style({ opacity: 1, transform: 'translate(12px, 1px)' }))
    ]
  ),
  transition(
    ':leave', [
      style({ opacity: 1, transform: 'translate(12px, 1px)' }),
      animate('300ms ease-out', style({ opacity: 0, transform: 'translate(0, 1px)' }))
    ]
  )]
);

export const myWizardAnimation = trigger('myWizardAnimation', [
  transition(
    ':leave', [
      style({ opacity: 1 }),
      animate('250ms 10ms ease-in', style({ opacity: 0 }))
    ]
  )]
);

export const slowFadeIn = trigger('slowFadeIn', [
  transition(
    ':enter', [
      style({ opacity: 0 }),
      animate('250ms 10ms ease-in', style({ opacity: 1 }))
    ]
  )]
);

export const slowFadeOut = trigger('slowFadeOut', [
  transition(
    ':leave', [
      style({ opacity: 1 }),
      animate('500ms 100ms ease-in', style({ opacity: 0 }))
    ]
  )]
);

export const historyItemRemove = trigger('historyItemRemove', [
  transition(
    ':leave', [
      style({ 'max-height': '50px', 'margin-bottom': '12px', 'opacity': 1, 'overflow-y': 'hidden' }),
      animate('300ms ease-out', style({ 'max-height': 0, opacity: 0, 'margin-bottom': 0 }))
    ]
  )]
);

