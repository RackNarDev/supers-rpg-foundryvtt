import {Log} from '../../system/logger.js';

export const asf_onDeleteItem = (sheet, event) => {
  const confirmBeforeDelete = game.settings.get('supers', 'confirmBeforeDelete');
  const element = event.currentTarget;
  const id = element.dataset.id;
  const target = element.dataset.target || 'item';
  const item = sheet.actor.items.get(id);

  if (!item) {
    return;
  }

  let itemName = '';
  let deleteAction = () => false;

  if (target === 'item') {
    itemName = item.name;
    deleteAction = () => sheet.actor.deleteEmbeddedDocuments('Item', [id]);
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
