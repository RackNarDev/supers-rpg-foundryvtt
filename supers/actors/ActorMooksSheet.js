import {chatRollTheDice} from '../chat/chat-roll-the-dice.js';
import {parseToPositiveNumber} from '../system/validate.js';
import {Log} from '../system/logger.js';

export class SupersMooksActorSheet extends ActorSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ['supers', 'sheet', 'actor', 'mooks'], // ToDo: Werden noch nicht in Template gerendert
      width: 600,
      height: 200,
      template: 'systems/supers/actors/templates/actor-mooks-sheet.hbs',
    });
  }

  getData() {
    const dataRoot = super.getData();
    dataRoot.editMode = !!this.editMode;
    dataRoot.Aptitudes = dataRoot.items.filter(i => i.type === 'Aptitude');
    dataRoot.Advantages = dataRoot.items.filter(i => i.type === 'Advantage');
    dataRoot.DisAdvantages = dataRoot.items.filter(i => i.type === 'Advantage' || i.type === 'Disadvantage');
    dataRoot.Powers = dataRoot.items.filter(i => i.type === 'Power');
    dataRoot.Equipments = dataRoot.items.filter(i => i.type === 'Equipment');

    console.log(dataRoot);

    return dataRoot;
  }

  activateListeners(html) {
    super.activateListeners(html);
    html.find('[data-rolld6]').click(this._rollTheDice.bind(this));
    html.find('[data-action="delete"]').click(this._onDeleteItem.bind(this));

  }

  _getHeaderButtons() {
    const buttons = super._getHeaderButtons();

    // Edit mode button to toggle which interactive elements are visible on the sheet.
    const canConfigure = game.user?.isGM || this.actor.isOwner;

    if (this.options.editable && canConfigure) {
      buttons.unshift(
          {
            class: 'su_toggle-edit-mode',
            label: game.i18n.localize('SUPERS.Buttons.ToggleEditMode'),
            icon: 'fas fa-edit',
            onclick: e => this._onToggleEditMode(e),
          },
      );
    }

    return buttons;
  }

  _onToggleEditMode(e) {
    e.preventDefault();

    this.editMode = !this.editMode;

    const target = $(e.currentTarget);
    const app = target.parents('.app');
    const html = app.find('.window-content');
    const focused = html.find(':focus');

    focused.trigger('change');

    setTimeout(() => {
      this.actor.render(false);
    }, 100);
  }

  _onDeleteItem(event) {
    event.preventDefault();

    const confirmBeforeDelete = game.settings.get('supers', 'confirmBeforeDelete');
    const element = event.currentTarget;
    const id = element.dataset.id;
    const target = element.dataset.target || 'item';
    const item = this.actor.items.get(id);

    console.log({item, id, target});

    if (!item) {
      return;
    }

    let itemName = '';
    let deleteAction = () => false;

    if (target === 'item') {
      itemName = item.name;
      deleteAction = () => this.actor.deleteEmbeddedDocuments('Item', [id]);
    } else if (target === 'specializations' || target === 'edges') {
      const index = element.dataset.index;
      const list = item.system[target] || [];

      if (!list[index]) {
        return;
      }

      itemName = list[index].label;
      list.splice(parseInt(index), 1);
      Log.fine(`_onDeleteItem() list (new):`, list);
      deleteAction = () => item.update({[`data.${target}`]: list});
    }

    if (confirmBeforeDelete) {
      Dialog.confirm({
        title: game.i18n.format('SUPERS.DeleteItemTitle', {name: itemName}),
        content: game.i18n.format('SUPERS.SureToDeleteItem', {name: itemName}),
        yes: deleteAction,
        no: () => {
          ui.notifications.info(game.i18n.format('SUPERS.Cancel'));
        },
        defaultYes: false,
      });
    } else {
      deleteAction();
    }

  }

  async _rollTheDice(event) {
    event.preventDefault();

    console.log(event);

    const useChaosDice = game.settings.get('supers', 'useChaosDice');
    const diceDialogSetting = game.settings.get('supers', 'diceDialogSetting');
    const rollString = event.currentTarget.dataset.rolld6;
    const rollaction = event.currentTarget.dataset.rollaction;
    const diceMax = event.currentTarget.dataset.dicemax;
    const options = {
      diceAmount: parseInt(rollString),
      rollaction,
      diceMax,
      useChaosDice,
      modifierDice: {tempCompetencyDice: 0, actorCompetencyDice: 0, otherPoolCompetencyDice: 0, bonusDice: 0},
    };

    if (!rollString) {
      return;
    }

    if (('openOnClick' === diceDialogSetting && !event.altKey) ||
        ('openWithAltKey' === diceDialogSetting && event.altKey)) {

      const data = {actor: this.actor, options};
      const contentHtml = await renderTemplate(`systems/supers/dialogs/dice-roll.hbs`, data);
      const dialogOptions = {
        width: 600,
        // height: 400
      };

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
                  // + tempCompetencyDice + actorCompetencyDice + otherPoolCompetencyDice
                  + bonusDice;
              options.modifierDice = {tempCompetencyDice, actorCompetencyDice, otherPoolCompetencyDice, bonusDice};

              await chatRollTheDice(options, this.actor);
            },
            icon: `<i class="fas fa-check"></i>`,
          },
        },
      }, dialogOptions).render(true);

    } else {
      await chatRollTheDice(options, this.actor);
    }
  }
}


