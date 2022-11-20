import {chatRollTheDice} from '../chat/chat-roll-the-dice.js';
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

    dataRoot.Aptitudes = dataRoot.items.filter(i => i.type === 'Aptitude');
    dataRoot.Advantages = dataRoot.items.filter(i => i.type === 'Advantage');
    dataRoot.Disadvantages = dataRoot.items.filter(i => i.type === 'Disadvantage');
    dataRoot.Powers = dataRoot.items.filter(i => i.type === 'Power');
    dataRoot.Equipments = dataRoot.items.filter(i => i.type === 'Equipment');

    dataRoot.Costs = {};

    let resistancesCosts = 0;
    for (let [key, value] of Object.entries(dataRoot.actor.data.data.Resistances)) {
      resistancesCosts += Math.max(parseInt(value.max) - 1, 0);
    }
    dataRoot.Costs.Resistances = resistancesCosts;

    let aptitudesCost = 0;
    dataRoot.Aptitudes.forEach(i => {
      i.data.costs = Math.max(parseInt(i.data.rating) - 1);
      aptitudesCost += i.data.costs;

      if (i.data.specializations.length > 0) {
        i.data.specializations.forEach(s => {
          s.costs = Math.max(parseInt(s.rating) - parseInt(i.data.rating), 0);
          aptitudesCost += s.costs;
        });
      }

    });
    dataRoot.Costs.Aptitudes = aptitudesCost;

    let disAdvantagesCost = 0;
    dataRoot.Advantages.forEach(i => {
      disAdvantagesCost += Math.max(parseInt(i.data.rating), 0);
    });

    dataRoot.Disadvantages.forEach(i => {
      disAdvantagesCost -= parseInt(i.data.rating);
    });

    dataRoot.Costs.DisAdvantages = disAdvantagesCost;

    let powersCost = 0;
    dataRoot.Powers.forEach(i => {
      let costs = 0;
      costs += Math.max(parseInt(i.data.rating), 0);
      if (i.data.edges.length > 0) {
        i.data.edges.forEach(s => {
          if (s.type === 'boost') {
            costs += parseInt(s.rating);
          }
          if (s.type === 'complication') {
            costs -= parseInt(s.rating);
          }
        });
      }

      i.data.costs = costs;
      powersCost += costs;
    });
    dataRoot.Costs.Powers = powersCost;

    // console.log(dataRoot.data.data);
    dataRoot.Costs.Competency = Number(dataRoot.data.data.Competency.max);

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
      const list = item.data.data[target] || [];
      Log.fine(`_onEditItem() list:`, list);

      list[index][field] = value;

      return item.update({[`data.${target}`]: list});

    } else if (target === 'item') {

      const item = this.actor.items.get(id);
      Log.fine(`_onEditItem() item:`, item);

      if (!item) {
        return;
      }

      if (item.data.type === 'Aptitude' && field === 'data.rating') {
        value = Math.min(3, value); // Aptitude Aptitudes are limited to 3
      }

      return item.update({[field]: value});

    }
  }

  _onDeleteItem(event) {
    Log.fine('_onDeleteItem(event)', event);

    const element = event.currentTarget;
    const id = element.dataset.id;
    const target = element.dataset.target || 'item';

    Log.fine(`_onEditItem() data:`, {id, target});

    if (target === 'item') {

      return this.actor.deleteEmbeddedDocuments('Item', [id]);

    } else if (target === 'specializations' || target === 'edges') {

      const item = this.actor.items.get(id);
      Log.fine(`_onDeleteItem() item:`, item);

      if (!item) {
        return;
      }

      const index = element.dataset.index;
      const list = item.data.data[target] || [];
      Log.fine(`_onDeleteItem() list:`, list);

      if (!list[index]) {
        return;
      }

      list.splice(parseInt(index), 1);
      Log.fine(`_onDeleteItem() list (new):`, list);

      return item.update({[`data.${target}`]: list});

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
      const list = item.data.data[target] || [];
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

    const state = item.data.data.state === 'edit' ? '' : 'edit';

    return item.update({['data.state']: state});
  }

  async _rollTheDice(event) {
    Log.fine('_rollTheDice(event)', event);

    event.preventDefault();

    const rollString = event.currentTarget.dataset.rolld6;
    const rollaction = event.currentTarget.dataset.rollaction;
    const diceMax = event.currentTarget.dataset.dicemax;

    Log.fine(`_rollTheDice() data:`, {rollString, rollaction, diceMax});

    if (!rollString) {
      return;
    }

    await chatRollTheDice(parseInt(rollString), rollaction, diceMax, this.actor);
  }
}


