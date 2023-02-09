import './system/handlebarsHelpers.js';
import {preloadHandlebarsTemplates} from './system/preloadHandlebarsTemplates.js';
import {registerSystemSettings} from './system/registerSystemSettings.js';
import {customizeItemDirectoryAppearance} from './system/customizeItemDirectoryAppearance.js';
import {Log} from './system/logger.js';

import {SupersHeroActorSheet} from './actors/ActorHeroSheet.js';
import {SupersMooksActorSheet} from './actors/ActorMooksSheet.js';
import {SupersItemSheet} from './items/ItemSheet.js';
import PartyOverviewApp from './party/PartyOverviewApp.js';
import {SupersCombat} from './combat/SupersCombat.js';

let partyOverview;

Hooks.once('init', function() {
  Log.info('Initializing System');

  CONFIG.Combat.documentClass = SupersCombat;

  registerSystemSettings();

  Actors.unregisterSheet('core', ActorSheet);
  Actors.registerSheet('supers', SupersHeroActorSheet, {makeDefault: true, types: ['Hero']});
  Actors.registerSheet('supers', SupersMooksActorSheet, {types: ['Mooks']});

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

Hooks.on('renderActorDirectory', (app, html, data) => {

  if (!game.user.isGM) return;
  if (!partyOverview) partyOverview = new PartyOverviewApp();

  const button = $(`<button class="party-overview-button"><i class="fas fa-users"></i> ${game.i18n.format(
      'SUPERS.PartyOverview')}</button>`);
  button.on('click', (e) => partyOverview.render(true));

  $(html).find('.header-actions').prepend(button);
});

Hooks.on('updateActor', (actor, data, options, userId) => {
  if (!partyOverview) partyOverview = new PartyOverviewApp();
  if (partyOverview.rendering && actor.hasPlayerOwner) {
    partyOverview.render(false);
  }
});

Hooks.on('updateToken', (token, data, options, userId) => {
  if (!partyOverview) partyOverview = new PartyOverviewApp();
  if (partyOverview.rendering && token.actor?.hasPlayerOwner) {
    partyOverview.render(false);
  }
});

Hooks.on('createToken', (token, options, userId) => {
  if (!partyOverview) partyOverview = new PartyOverviewApp();
  if (partyOverview.rendering && game.actors.contents.find((actor) => actor.id === token.actor.id).hasPlayerOwner) {
    partyOverview.render(false);
  }
});

Hooks.on('deleteActor', (actor, options, userId) => {
  if (!partyOverview) partyOverview = new PartyOverviewApp();
  if (partyOverview.rendering && actor.hasPlayerOwner) {
    partyOverview.render(false);
  }
});

Hooks.on('deleteToken', (token, options, userId) => {
  if (!partyOverview) partyOverview = new PartyOverviewApp();
  if (partyOverview.rendering && token.actor?.hasPlayerOwner) {
    partyOverview.render(false);
  }
});
