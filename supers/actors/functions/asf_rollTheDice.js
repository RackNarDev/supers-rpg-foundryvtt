import {parseToPositiveNumber} from '../../system/validate.js';
import {rollDialog} from '../../system/rollDialog.js';
import {initiativeRoll} from '../../system/initiative-roll.js';
import {rollTheDice} from '../../system/roll-the-dice.js';

export const asf_rollTheDice = async (actor, event) => {
  event.preventDefault();

  const useChaosDice = game.settings.get('supers', 'useChaosDice');
  const diceDialogSetting = game.settings.get('supers', 'diceDialogSetting');

  const dataset = event.currentTarget.dataset;
  const rollString = dataset.rolld6;
  const rollaction = dataset.rollaction;
  const rollInitiative = 'true' === dataset.rollinitiative;
  const initiativeaction = dataset.initiativeaction;
  const diceMax = dataset.dicemax;

  const options = {
    diceAmount: parseToPositiveNumber(rollString),
    diceMax: parseToPositiveNumber(diceMax),
    rollaction: rollInitiative
        ? `${game.i18n.format('SUPERS.InitiativeRoll')}${initiativeaction ? ':' : ''} ${initiativeaction || ''}`
        : rollaction,
    useChaosDice,
    modifierDice: {tempCompetencyDice: 0, actorCompetencyDice: 0, otherPoolCompetencyDice: 0, bonusDice: 0},
  };

  if (!rollString) {
    return;
  }

  if (('openOnClick' === diceDialogSetting && !event.altKey) ||
      ('openWithAltKey' === diceDialogSetting && event.altKey)) {
    if (rollInitiative) {
      await rollDialog(actor, options, async r => await initiativeRoll(actor, r));
    } else {
      await rollDialog(actor, options, async r => await rollTheDice(actor, r));
    }
  } else {
    if (rollInitiative) {
      await initiativeRoll(actor, options);
    } else {
      await rollTheDice(actor, options);
    }
  }
};
