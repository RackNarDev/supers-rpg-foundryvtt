import {asf_rollDialog} from '../actors/functions/asf_rollDialog.js';
import {parseToPositiveNumber} from '../system/validate.js';

export class SupersCombat extends Combat {

  /**
   * Roll initiative for one or multiple Combatants within the Combat document
   * @param {string|string[]} ids     A Combatant id or Array of ids for which to roll
   * @param {object} [options={}]     Additional options which modify how initiative rolls are created or presented.
   * @param {string|null} [options.formula]         A non-default initiative formula to roll. Otherwise, the system
   *                                                default is used.
   * @param {boolean} [options.updateTurn=true]     Update the Combat turn after adding new initiative scores to
   *                                                keep the turn on the same Combatant.
   * @param {object} [options.messageOptions={}]    Additional options with which to customize created Chat Messages
   * @returns {Promise<Combat>}       A promise which resolves to the updated Combat document once updates are complete.
   */
  async rollInitiative(ids, {formula = null, updateTurn = true, messageOptions = {}} = {}) {
    const useChaosDice = game.settings.get('supers', 'useChaosDice');
    const diceDialogSetting = game.settings.get('supers', 'diceDialogSetting');
    const openDialog = ('openOnClick' === diceDialogSetting);

    // Structure input data
    ids = typeof ids === 'string' ? [ids] : ids;

    for (let [i, id] of ids.entries()) {

      // Get Combatant data (non-strictly)
      const combatant = this.combatants.get(id);
      if (!combatant?.isOwner) {
        continue;
      }

      const actor = game.actors.get(combatant.actorId);
      let options;
      switch (actor.type) {
        case 'Hero':
          options = {
            diceAmount: parseToPositiveNumber(actor.system.Initiative.value),
            diceMax: actor.system.Initiative.useAptitude ? null : 3,
            rollaction: `${game.i18n.format('SUPERS.InitiativeRoll')}: ${actor.system.Initiative.action}`,
            useChaosDice,
            modifierDice: {tempCompetencyDice: 0, actorCompetencyDice: 0, otherPoolCompetencyDice: 0, bonusDice: 0},
          };
          break;
        case 'Mooks':
          options = {
            diceAmount: parseToPositiveNumber(actor.system.Powerlevel),
            diceMax: null,
            rollaction: `${game.i18n.format('SUPERS.InitiativeRoll')}`,
            useChaosDice,
            modifierDice: {tempCompetencyDice: 0, actorCompetencyDice: 0, otherPoolCompetencyDice: 0, bonusDice: 0},
          };
          break;
      }

      await asf_rollDialog(actor, options, true, openDialog);
    }

    return this;
  }
}
