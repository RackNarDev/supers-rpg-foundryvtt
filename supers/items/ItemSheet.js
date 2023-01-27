export class SupersItemSheet extends ItemSheet {
  get template() {
    return `systems/supers/items/templates/${this.object.type}-sheet.hbs`;
  }
}
