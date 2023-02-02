import {chatRollTheDice} from '../chat/chat-roll-the-dice.js';
import {parseToPositiveNumber} from '../system/validate.js';
import {Log} from '../system/logger.js';

export class SupersHeroActorSheet extends ActorSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ['supers', 'sheet', 'actor', 'hero'], // ToDo: Werden noch nicht in Template gerendert
      template: 'systems/supers/actors/templates/actor-hero-sheet.hbs',
    });
  }

  getData() {
    const dataRoot = super.getData();

    dataRoot.editMode = !!this.editMode;
    dataRoot.Aptitudes = dataRoot.items.filter(i => i.type === 'Aptitude');
    dataRoot.Advantages = dataRoot.items.filter(i => i.type === 'Advantage');
    dataRoot.Disadvantages = dataRoot.items.filter(i => i.type === 'Disadvantage');
    dataRoot.Powers = dataRoot.items.filter(i => i.type === 'Power');
    dataRoot.Equipments = dataRoot.items.filter(i => i.type === 'Equipment');

    dataRoot.Costs = {};

    let resistancesCosts = 0;

    for (let [_, value] of Object.entries(dataRoot.data.system.Resistances)) {
      resistancesCosts += Math.max(parseToPositiveNumber(value.max) - 1, 0);
    }
    dataRoot.Costs.Resistances = resistancesCosts;

    let aptitudesCost = 0;
    dataRoot.Aptitudes.forEach(i => {
      i.system.costs = Math.max(parseToPositiveNumber(i.system.rating) - 1, 0);
      aptitudesCost += i.system.costs;

      if (i.system.specializations.length > 0) {
        i.system.specializations.forEach(s => {
          const rating = Math.max(parseToPositiveNumber(s.rating), 3);
          s.rating = rating;
          s.costs = Math.max(rating - parseToPositiveNumber(i.system.rating), 0);
          aptitudesCost += s.costs;
        });
      }

    });
    dataRoot.Costs.Aptitudes = aptitudesCost;

    let disAdvantagesCost = 0;
    dataRoot.Advantages.forEach(i => {
      disAdvantagesCost += parseToPositiveNumber(i.system.rating);
    });

    dataRoot.Disadvantages.forEach(i => {
      disAdvantagesCost -= parseToPositiveNumber(i.system.rating);
    });

    dataRoot.Costs.DisAdvantages = disAdvantagesCost;

    let powersCost = 0;
    dataRoot.Powers.forEach(i => {
      let costs = parseToPositiveNumber(i.system.rating);
      if (i.system.edges.length > 0) {
        i.system.edges.forEach(s => {
          if (s.type.toLowerCase() === 'boost') {
            costs += parseToPositiveNumber(s.rating);
          }
          if (s.type.toLowerCase() === 'complication') {
            costs -= parseToPositiveNumber(s.rating);
          }
        });
      }

      i.system.costs = costs;
      powersCost += costs;
    });
    dataRoot.Costs.Powers = powersCost;

    dataRoot.Costs.Competency = parseToPositiveNumber(dataRoot.data.system.Competency.max);

    dataRoot.Costs.Total = dataRoot.Costs.Competency +
        dataRoot.Costs.Powers +
        dataRoot.Costs.DisAdvantages +
        dataRoot.Costs.Aptitudes +
        dataRoot.Costs.Resistances;

    return dataRoot;
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find('[data-action="inline-edit"]').change(this._onEditItem.bind(this));
    html.find('[data-action="delete"]').click(this._onDeleteItem.bind(this));
    html.find('[data-action="add"]').click(this._onAddItem.bind(this));

    html.find('[data-action="edit-item"]').click(this._onToggleEditItem.bind(this));
    html.find('[data-rolld6]').click(this._rollTheDice.bind(this));
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

  _onEditItem(event) {
    Log.fine('_onEditItem(event)', event);

    event.preventDefault();

    const element = event.currentTarget;
    const field = element.dataset.field;
    const id = element.dataset.id;
    const target = element.dataset.target || 'item';

    let value = element.value;

    Log.fine(`_onEditItem() data:`, {id, value, target, field});

    if (target === 'actor') {

      return this.actor.update({[field]: value});

    } else if (target === 'specializations' || target === 'edges') {

      const item = this.actor.items.get(id);
      Log.fine(`_onEditItem() item:`, item);

      if (!item) {
        return;
      }

      const index = element.dataset.index;
      const list = item.system[target] || [];
      Log.fine(`_onEditItem() list:`, list);

      list[index][field] = value;

      return item.update({[`data.${target}`]: list});

    } else if (target === 'item') {

      const item = this.actor.items.get(id);
      Log.fine(`_onEditItem() item:`, item);

      if (!item) {
        return;
      }

      if (item.system.type === 'Aptitude' && field === 'data.rating') {
        value = Math.min(3, value); // Aptitude Aptitudes are limited to 3
      }

      return item.update({[field]: value});

    }
  }

  _onDeleteItem(event) {
    const confirmBeforeDelete = game.settings.get('supers', 'confirmBeforeDelete');
    const element = event.currentTarget;
    const id = element.dataset.id;
    const target = element.dataset.target || 'item';
    const item = this.actor.items.get(id);

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

  _onAddItem(event) {
    Log.fine('_onAddItem(event)', event);

    const defaultData = {
      specializations: {label: '', rating: ''},
      edges: {type: 'Complication', label: '', rating: ''},
    };

    const element = event.currentTarget;
    const id = element.dataset.id;
    const target = element.dataset.target || 'item';

    Log.fine(`_onAddItem() data:`, {id, target});

    if (target === 'specializations' || target === 'edges') {

      const item = this.actor.items.get(id);
      Log.fine(`_onAddItem() item:`, item);

      if (!item) {
        return;
      }

      const index = element.dataset.index;
      const list = item.system[target] || [];
      Log.fine(`_onAddItem() list:`, list);

      list.push({...defaultData[target]});
      Log.fine(`_onAddItem() list (new):`, list);

      return item.update({[`data.${target}`]: list});

    }

  }

  async _onToggleEditItem(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const item = this.actor.items.get(element.dataset.id);
    if (!item) {
      return;
    }

    const state = item.system.state === 'edit' ? '' : 'edit';
    item.update({['data.state']: state});
  }

  async _rollTheDice(event) {
    event.preventDefault();

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
                  + tempCompetencyDice + actorCompetencyDice + otherPoolCompetencyDice + bonusDice;
              options.modifierDice = {tempCompetencyDice, actorCompetencyDice, otherPoolCompetencyDice, bonusDice};

              console.log(this.actor.system.Competency.temp - tempCompetencyDice);

              this.actor.update({
                ['system.Competency.temp']: this.actor.system.Competency.temp - tempCompetencyDice,
                ['system.Competency.current']: this.actor.system.Competency.current - actorCompetencyDice,
              });

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


