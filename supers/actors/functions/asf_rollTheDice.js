import {parseToPositiveNumber} from '../../system/validate.js';
import {asf_rollDialog} from './asf_rollDialog.js';

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

  if (!rollString) {
    return;
  }

  const options = {
    diceAmount: parseToPositiveNumber(rollString),
    diceMax: parseToPositiveNumber(diceMax),
    rollaction: rollInitiative
        ? `${game.i18n.format('SUPERS.InitiativeRoll')}${initiativeaction ? ':' : ''} ${initiativeaction || ''}`
        : rollaction,
    useChaosDice,
    modifierDice: {tempCompetencyDice: 0, actorCompetencyDice: 0, otherPoolCompetencyDice: 0, bonusDice: 0},
  };

  const openDialog = ('openOnClick' === diceDialogSetting && !event.altKey) ||
      ('openWithAltKey' === diceDialogSetting && event.altKey);

  return asf_rollDialog(actor, options, rollInitiative, openDialog);
};
