const LEVELS = {
  finest: 0,
  fine: 1,
  info: 2,
  debug: 3,
  error: 4,
};

const levelTxt = {};
levelTxt[LEVELS.finest] = 'finest: ';
levelTxt[LEVELS.fine] = 'fine: ';
levelTxt[LEVELS.info] = 'info: ';
levelTxt[LEVELS.debug] = 'debug: ';
levelTxt[LEVELS.error] = 'error: ';

export class Log {
  static ACTIVE = true;
  static LOGLEVEL = LEVELS.finest;

  static finest(msg = '', ...args) {
    if (!this.ACTIVE) {
      return;
    }

    if (this.LOGLEVEL > LEVELS.finest) {
      return;
    }

    return this.logging(LEVELS.finest, msg, args);
  }

  static fine(msg = '', ...args) {
    if (!this.ACTIVE) {
      return;
    }

    if (this.LOGLEVEL > LEVELS.fine) {
      return;
    }
    return this.logging(LEVELS.fine, msg, args);
  }

  static info(msg = '', ...args) {
    if (!this.ACTIVE) {
      return;
    }

    if (this.LOGLEVEL > LEVELS.info) {
      return;
    }
    return this.logging(LEVELS.info, msg, args);
  }

  static debug(msg = '', ...args) {
    if (!this.ACTIVE) {
      return;
    }
    if (this.LOGLEVEL > LEVELS.debug) {
      return;
    }

    return this.logging(LEVELS.debug, msg, args);
  }

  static error(msg = '', ...args) {
    if (!this.ACTIVE) {
      return;
    }
    if (this.LOGLEVEL > LEVELS.error) {
      return;
    }
    return this.logging(LEVELS.error, msg, args);
  }

  static logging(lvl, msg, args) {
    console.log(`Supers | ${levelTxt[lvl]}:`, msg, ...args);
  }
}
