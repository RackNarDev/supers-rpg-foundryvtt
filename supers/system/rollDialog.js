import {parseToPositiveNumber} from './validate.js';

const template = 'systems/supers/dialogs/dice-roll.hbs';

export const rollDialog = async (actor, options, onSuccess) => {

  const dialogOptions = {width: 600};
  const contentHtml = await renderTemplate(template, {actor, options});

  new Dialog({
    title: game.i18n.format('SUPERS.DiceRollOptions'),
    content: contentHtml,
    buttons: {
      cancel: {label: game.i18n.format('SUPERS.Cancel')},
      roll: {
        label: game.i18n.format('SUPERS.RollTheDice'),

        callback: async html => {
          const tempCompetencyDice = parseToPositiveNumber(html.find('#s_dd_temp-cd').val());
          const actorCompetencyDice = parseToPositiveNumber(html.find('#s_dd-a-cd').val());
          const otherPoolCompetencyDice = parseToPositiveNumber(html.find('#s_dd_op-cd').val());
          const bonusDice = parseToPositiveNumber(html.find('#s_dd_bd').val());

          options.diceAmount = options.diceAmount
              + tempCompetencyDice + actorCompetencyDice + otherPoolCompetencyDice + bonusDice;
          options.modifierDice = {tempCompetencyDice, actorCompetencyDice, otherPoolCompetencyDice, bonusDice};

          if (actor.system.Competency) {
            actor.update({
              ['system.Competency.temp']: actor.system.Competency.temp - tempCompetencyDice,
              ['system.Competency.current']: actor.system.Competency.current - actorCompetencyDice,
            });
          }

          onSuccess(options);

        },
        icon: `<i class="fas fa-check"></i>`,
      },
    },
  }, dialogOptions).render(true);
};
