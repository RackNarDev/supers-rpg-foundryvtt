import {parseToPositiveNumber} from '../system/validate.js';
import {Log} from '../system/logger.js';
import {asf_rollTheDice} from './functions/asf_rollTheDice.js';
import {asf_getHeaderButtons} from './functions/asf_getHeaderButtons.js';
import {asf_onDeleteItem} from './functions/asf_onDeleteItem.js';

export class SupersHeroActorSheet extends ActorSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ['supers', 'sheet', 'actor', 'hero'], // ToDo: Werden noch nicht in Template gerendert
      template: 'systems/supers/actors/templates/actor-hero-sheet.hbs',
    });
  }

  getData() {
    Log.fine('SupersHeroActorSheet.getData()');

    const dataRoot = super.getData();

    dataRoot.editMode = !!this.editMode;
    dataRoot.Aptitudes = dataRoot.items.filter(i => i.type === 'Aptitude');
    dataRoot.Advantages = dataRoot.items.filter(i => i.type === 'Advantage');
    dataRoot.Disadvantages = dataRoot.items.filter(i => i.type === 'Disadvantage');
    dataRoot.Powers = dataRoot.items.filter(i => i.type === 'Power');
    dataRoot.Equipments = dataRoot.items.filter(i => i.type === 'Equipment');

    dataRoot.actor.system.Initiative = dataRoot.actor.system.Initiative ||
        {base: '', useAptitude: false, value: 0, action: ''};

    if (!dataRoot.actor.system.Initiative.base) {
      dataRoot.actor.system.Initiative.base = 'Reaction';
    }

    dataRoot.actor.system.Initiative.useAptitude = false;

    if (dataRoot.actor.system.Initiative.base === 'Reaction') {
      dataRoot.actor.system.Initiative.value = dataRoot.data.system.Resistances.Reaction.current;
      dataRoot.actor.system.Initiative.action = game.i18n.format('SUPERS.Reaction');
    } else if (dataRoot.actor.system.Initiative.base.startsWith('Aptitude:')) {
      const attr = dataRoot.actor.system.Initiative.base.split(':');
      const name = attr[1];
      const e = dataRoot.Aptitudes.find(i => i.name === name);

      if (e && attr.length === 2) {
        dataRoot.actor.system.Initiative.action = name;
        dataRoot.actor.system.Initiative.value = e.system?.rating ? e.system.rating : 0;
        dataRoot.actor.system.Initiative.useAptitude = true;
      } else if (e && attr.length === 4 && attr[2] === 'Specialization') {
        const s_name = attr[3];
        const s = e.system.specializations.find(i => i.label === s_name);
        dataRoot.actor.system.Initiative.action = `${s_name} (${name})`;
        dataRoot.actor.system.Initiative.value = s?.rating ? s.rating : 0;
        dataRoot.actor.system.Initiative.useAptitude = true;
      }
    } else if (dataRoot.actor.system.Initiative.base.startsWith('Power:')) {
      const name = dataRoot.actor.system.Initiative.base.split(':')[1];
      dataRoot.actor.system.Initiative.action = name;
      const e = dataRoot.Powers.find(i => i.name === name);
      dataRoot.actor.system.Initiative.value = e ? e.system.rating : 0;
    }

    this.actor.update({
      ['system.Initiative.base']: dataRoot.actor.system.Initiative.base,
      ['system.Initiative.value']: dataRoot.actor.system.Initiative.value,
      ['system.Initiative.useAptitude']: dataRoot.actor.system.Initiative.useAptitude,
      ['system.Initiative.action']: dataRoot.actor.system.Initiative.action,
    });

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
    html.find('[data-action="add"]').click(this._onAddItem.bind(this));
    html.find('[data-action="edit-item"]').click(this._onToggleEditItem.bind(this));

    html.find('[data-rolld6]').click(event => asf_rollTheDice(this.actor, event));
    html.find('[data-action="delete"]').click(event => asf_onDeleteItem(this, event));
  }

  _getHeaderButtons() {
    return asf_getHeaderButtons(this, super._getHeaderButtons());
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

}


