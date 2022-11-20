import './system/handlebarsHelpers.js';
import {preloadHandlebarsTemplates} from './system/preloadHandlebarsTemplates.js';
import {registerSystemSettings} from './system/registerSystemSettings.js';
import {customizeItemDirectoryAppearance} from './system/customizeItemDirectoryAppearance.js';
import {Log} from './system/logger.js';

import {SupersHeroActorSheet} from './actors/ActorHeroSheet.js';
import {SupersItemSheet} from './items/ItemSheet.js';

Hooks.once('init', function() {
  Log.info('Initializing System');

  registerSystemSettings();

  Actors.unregisterSheet('core', ActorSheet);
  Actors.registerSheet('supers', SupersHeroActorSheet, {makeDefault: true, types: ['Hero']});

  Items.unregisterSheet('core', ItemSheet);
  Items.registerSheet('supers', SupersItemSheet, {makeDefault: true});

  return preloadHandlebarsTemplates();
});

Hooks.on('renderItemDirectory', async function(app, html, data) {
  customizeItemDirectoryAppearance(app, html);
});

Hooks.on('renderChatMessage', (app, html, data) => {
  // console.log({app});
});

