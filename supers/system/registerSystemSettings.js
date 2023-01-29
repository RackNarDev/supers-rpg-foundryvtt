export function registerSystemSettings() {

  game.settings.register('supers', 'useChaosDice', {
    config: true,
    scope: 'world',
    name: 'SETTINGS.useChaosDice.name',
    hint: 'SETTINGS.useChaosDice.hint',
    type: Boolean,
    default: false,
  });

  game.settings.register('supers', 'diceDialogSetting', {
    config: true,
    scope: 'client',
    name: 'SETTINGS.diceDialogBehavior.name',
    hint: 'SETTINGS.diceDialogBehavior.hint',
    type: String,
    choices: {
      'openOnClick': 'SETTINGS.diceDialogBehavior.option1',
      'openWithAltKey': 'SETTINGS.diceDialogBehavior.option2',
    },
    default: 'openOnClick',
  });

  game.settings.register('supers', 'confirmBeforeDelete', {
    config: true,
    scope: 'client',
    name: 'SETTINGS.confirmBeforeDelete.name',
    hint: 'SETTINGS.confirmBeforeDelete.hint',
    type: Boolean,
    default: true,
  });

}
