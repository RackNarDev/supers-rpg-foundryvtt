export const asf_onToggleEditMode = (sheet, event) => {
  event.preventDefault();

  sheet.editMode = !sheet.editMode;

  const target = $(event.currentTarget);
  const app = target.parents('.app');
  const html = app.find('.window-content');
  const focused = html.find(':focus');

  focused.trigger('change');

  setTimeout(() => {
    sheet.actor.render(false);
  }, 100);
};
