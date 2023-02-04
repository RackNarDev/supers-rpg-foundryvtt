import {Log} from '../system/logger.js';

export const executeDieRoll = async (actor, template, options) => {
  Log.fine('executeDieRoll():', actor, template, options);

  const {diceAmount, rollaction, diceMax, useChaosDice} = options;
  const rollFormula = useChaosDice ? `${diceAmount - 1}d6 + 1d6x` : `${diceAmount}d6`;
  const roll = await new Roll(rollFormula).evaluate({async: true});
  const dice = roll?.terms[0]?.results?.map((i, idx) => ({value: i.result, isChaos: false, idx}));

  Log.fine('executeDieRoll() data :', {rollFormula, roll, dice});

  if (useChaosDice) {
    let v = 0;
    roll.terms[2].results.forEach(i => v += i.result);
    dice.push({value: v, isChaos: true, idx: diceAmount - 1});
  }

  dice.sort((a, b) => a.value < b.value ? 1 : -1);
  Log.finest('chatRollTheDice() dice.sort :', dice);

  let sum = 0;
  dice.forEach((_, idx) => {
    if (!diceMax || dice.length <= diceMax || idx < diceMax) {
      sum += dice[idx].value;
      dice[idx].used = true;
    } else {
      dice[idx].used = false;
    }
  });
  Log.finest('chatRollTheDice() dice used :', dice);

  dice.sort((a, b) => a.idx > b.idx ? 1 : -1);
  Log.finest('chatRollTheDice() dice.sort :', dice);
  const usedDice = dice.filter(i => i.used);
  const unusedDice = dice.filter(i => !i.used);

  const templateData = {
    actor,
    rollaction,
    dice,
    usedDice,
    unusedDice,
    sum,
  };

  const chatData = {
    user: game.user?._id,
    speaker: ChatMessage.getSpeaker({actor}),
    type: CONST.CHAT_MESSAGE_TYPES.ROLL,
    sound: CONFIG.sounds.dice,
    roll: roll,
    rollMode: game.settings.get('core', 'rollMode'),
    content: await renderTemplate(template, templateData),

    flags: {
      templateVariables: templateData,
    },
  };

  await ChatMessage.create(chatData);

  return {roll, dice, usedDice, unusedDice, sum};
};
