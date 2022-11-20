Handlebars.registerHelper('s_a_value', function(key, ...args) {
  const valuesRoot = this.actor.data.data;
  let t = valuesRoot[key] || '';
  if (args.length > 1) {
    for (let i = 0; i < args.length - 1; i++) { // Last arg are the handlebar options
      t = t[args[i]] || '';
    }
  }

  return t;
});

Handlebars.registerHelper('s_i_value', function(key, ...args) {
  const valuesRoot = this.item.data.data;

  let t = valuesRoot[key] || '';
  if (args.length > 1) {
    for (let i = 0; i < args.length - 1; i++) { // Last arg are the handlebar options
      t = t[args[i]] || '';
    }
  }

  return t;
});

Handlebars.registerHelper('s_i18n', function(key, ...args) {
  return game.i18n.format(`SUPERS.${key}`);
});

Handlebars.registerHelper('s_i_i18n', function(item, ...args) {
  const valuesRoot = item.data;
  return valuesRoot[game.i18n.lang] || valuesRoot['en'] || item.name;
});

Handlebars.registerHelper('select', function(value, options) {
  var $el = $('<select />').html(options.fn(this));
  $el.find('[value="' + value + '"]').attr({'selected': 'selected'});
  return $el.html();
});

Handlebars.registerHelper('actorPart', function(key, options) {
  const root = 'systems/supers/actors/templates/parts/';

  return `${root}${key}.hbs`; //'systems/supers/templates/actors/parts/advantages-disadvantages-entries.hbs';
});

Handlebars.registerHelper('cmp', function(key, options) {
  const root = 'systems/supers/template_components/';

  return `${root}${key}.hbs`;
});

Handlebars.registerHelper('stateClass', function(key, val, options) {
  const root = 'systems/supers/template_components/';

  return key === val ? ` state__${key}` : '';
});
