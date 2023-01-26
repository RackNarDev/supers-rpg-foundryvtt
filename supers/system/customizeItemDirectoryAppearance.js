export function customizeItemDirectoryAppearance(app, html) {
  app.documents.forEach(o => {
    const htmlEntry = html.find(`.directory-item[data-document-id="${o.id}"]`);
    if (!htmlEntry) {
      return;
    }

    htmlEntry.addClass(`supers-${o.type.toLowerCase()}-item`);

    const valuesRoot = o.system;
    const label = valuesRoot[game.i18n.lang] || valuesRoot['en'] || o.name;
    const itemType = game.i18n.format(`SUPERS.${o.type}`);
    const header = htmlEntry.find('.document-name a');
    header.html(`<span class="name">${label}</span><span class="type">${itemType}</span>`);
  });

  app.folders.forEach(o => {
    const htmlEntry = html.find(`.directory-item[data-folder-id="${o.id}"]`);
    if (!htmlEntry) {
      return;
    }

    htmlEntry.addClass(`supers-${o.name.toLowerCase()}-folder`);
    const name = game.i18n.format(`SUPERS.${o.name}`);
    const header = htmlEntry.find('header h3');
    header.html(`<i class="fas fa-folder-open fa-fw"></i>${name}`);

    const sub = htmlEntry.find('.subdirectory');
    const li = sub.find('li');
    li.sort((a, b) => {
      return ($(b).find('.name').html()) < ($(a).find('.name').html()) ? 1 : -1;
    }).appendTo(sub);

  });
}
