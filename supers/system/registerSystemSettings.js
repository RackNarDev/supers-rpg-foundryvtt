export function registerSystemSettings() {

  game.settings.register('supers', 'useChaosDice', {
    config: true,
    scope: 'world',
    name: 'SETTINGS.useChaosDice.name',
    hint: 'SETTINGS.useChaosDice.hint',
    type: Boolean,
    default: false,
  });

}
