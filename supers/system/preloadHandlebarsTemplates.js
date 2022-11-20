export async function preloadHandlebarsTemplates() {

  const templatesPath = [
    // Actor
    'systems/supers/actors/templates/parts/advantages-disadvantages-entries.hbs',
    'systems/supers/actors/templates/parts/advantages-disadvantages-panel.hbs',
    'systems/supers/actors/templates/parts/aptitudes-panel.hbs',
    'systems/supers/actors/templates/parts/aptitudes-edit-panel.hbs',
    'systems/supers/actors/templates/parts/aptitudes-detail-panel.hbs',
    'systems/supers/actors/templates/parts/aptitudes-row.hbs',
    'systems/supers/actors/templates/parts/competency-panel.hbs',
    'systems/supers/actors/templates/parts/equipment-panel.hbs',
    'systems/supers/actors/templates/parts/powers-panel.hbs',
    'systems/supers/actors/templates/parts/powers-edit-panel.hbs',
    'systems/supers/actors/templates/parts/powers-detail-panel.hbs',
    'systems/supers/actors/templates/parts/powers-row.hbs',
    'systems/supers/actors/templates/parts/resistance-panel.hbs',
    'systems/supers/actors/templates/parts/resistance-row.hbs',

    'systems/supers/actors/templates/parts/panel-header.hbs',

    // Items
    'systems/supers/items/templates/parts/item-base-attributes.hbs',

    // components
    'systems/supers/template_components/add-btn.hbs',
    'systems/supers/template_components/costs.hbs',
    'systems/supers/template_components/delete-btn.hbs',
    'systems/supers/template_components/dice-roll.hbs',
    'systems/supers/template_components/edit-item-btn.hbs',
    'systems/supers/template_components/inline-edit.hbs',
  ];

  return loadTemplates(templatesPath);
}
