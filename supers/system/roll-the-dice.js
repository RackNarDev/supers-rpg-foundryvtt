import {executeDieRoll} from './execute-die-roll.js';

const template = 'systems/supers/chat/templates/roll-result.hbs';

export async function rollTheDice(actor, options) {
  return executeDieRoll(actor, template, options);
}
