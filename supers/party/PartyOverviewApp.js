class PartyOverviewApp extends Application {
  constructor(options) {
    super(options);
  }

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      width: 900,
      height: 'fit-content',
      resizable: true,
      title: game.i18n.format('SUPERS.PartyOverview'),
      template: 'systems/supers/party/group-sheet.hbs',
      classes: ['party-overview-window', game.system.id],
      tabs: [
        {
          navSelector: '.tabs',
          contentSelector: '.content',
          initial: 'general',
        },
      ],
    });
  }

  update() {
    let actors = game.actors.contents.filter((a) => a.hasPlayerOwner);
    let users = game.users.filter((u) => u.character).map((u) => u.character.id);
    actors = actors.filter((playerActor) => users.includes(playerActor.id));
    // remove duplicates if an actors has multiple tokens on scene
    actors = actors.reduce(
        (actors, actor) => (actors.map((a) => a.id).includes(actor.id) ? actors : [...actors, actor]), []);
    actors = actors.map((actor) => {
      const Aptitudes = actor.items.filter(i => i.type === 'Aptitude');
      const Advantages = actor.items.filter(i => i.type === 'Advantage');
      const Disadvantages = actor.items.filter(i => i.type === 'Disadvantage');
      const Powers = actor.items.filter(i => i.type === 'Power');
      const Equipments = actor.items.filter(i => i.type === 'Equipment');

      return {
        ...actor,
        Aptitudes,
        Advantages,
        Disadvantages,
        Powers,
        Equipments,
      };
    });

    this.state = {
      actors,
    };

  }

  getData() {
    this.update();
    return this.state;
  }

  activateListeners(html) {

    super.activateListeners(html);
  }

  render(force, options) {
    this.rendering = true;
    super.render(force, options);
  }

  close() {
    this.rendering = false;
    super.close();
  }
}

export default PartyOverviewApp;
