import {asf_onToggleEditMode} from './asf_onToggleEditMode.js';

export const asf_getHeaderButtons = (sheet, buttons) => {
  const canConfigure = game.user?.isGM || sheet.actor.isOwner;

  if (sheet.options.editable && canConfigure) {
    buttons.unshift(
        {
          class: 'su_toggle-edit-mode',
          label: game.i18n.localize('SUPERS.Buttons.ToggleEditMode'),
          icon: 'fas fa-edit',
          onclick: event => asf_onToggleEditMode(sheet, event),
        },
    );
  }

  return buttons;
};
