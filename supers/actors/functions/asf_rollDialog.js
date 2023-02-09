import {rollDialog} from '../../system/rollDialog.js';
import {initiativeRoll} from '../../system/initiative-roll.js';
import {rollTheDice} from '../../system/roll-the-dice.js';

export const asf_rollDialog = async (actor, options, rollInitiative, openDialog =false) => {

  if (openDialog) {
    if (rollInitiative) {
      return await rollDialog(actor, options, async r => await initiativeRoll(actor, r));
    } else {
      return await rollDialog(actor, options, async r => await rollTheDice(actor, r));
    }
  } else {
    if (rollInitiative) {
      return await initiativeRoll(actor, options);
    } else {
      return await rollTheDice(actor, options);
    }
  }

};
