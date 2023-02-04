import {executeDieRoll} from './execute-die-roll.js';

const template = 'systems/supers/chat/templates/roll-result.hbs';

/**
 * Execute a roll for initiative
 *
 * @param actor
 * @param options
 * @returns {Promise<{roll, dice, usedDice, unusedDice, sum}>}
 */
export const initiativeRoll = async (actor, options) => {

  const result = await executeDieRoll(actor, template, options);

  if (!game.combat) {
    ui.notifications.info(game.i18n.format('SUPERS.NoCombatTacker'));

    return result;
  }

  let combatant = game.combat.getCombatantByActor(actor._id);
  if (!combatant) {
    await game.combat.createEmbeddedDocuments('Combatant', [{actorId: actor._id}]);
    combatant = game.combat.getCombatantByActor(actor._id);
  }

  const initiatives = {
    _id: combatant._id,
    initiative: result.sum,
  };

  await game.combat.updateEmbeddedDocuments('Combatant', [initiatives]);

  return result;
};
