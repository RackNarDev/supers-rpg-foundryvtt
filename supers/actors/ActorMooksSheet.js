import {asf_rollTheDice} from './functions/asf_rollTheDice.js';
import {asf_getHeaderButtons} from './functions/asf_getHeaderButtons.js';
import {asf_onDeleteItem} from './functions/asf_onDeleteItem.js';

export class SupersMooksActorSheet extends ActorSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ['supers', 'sheet', 'actor', 'mooks'], // ToDo: Werden noch nicht in Template gerendert
      width: 600,
      height: 250,
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
    html.find('[data-rolld6]').click(event => asf_rollTheDice(this.actor, event));
    html.find('[data-action="delete"]').click(event => asf_onDeleteItem(this, event));
  }

  _getHeaderButtons() {
    return asf_getHeaderButtons(this, super._getHeaderButtons());
  }

}


