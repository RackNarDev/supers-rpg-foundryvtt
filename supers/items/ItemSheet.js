export class SupersItemSheet extends ItemSheet {
  get template() {
    return `systems/supers/items/templates/${this.item.system.type}-sheet.hbs`;
  }
}
