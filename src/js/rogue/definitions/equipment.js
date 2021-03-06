
import { Item } from './item';
import * as Fakes from '../constants/faketypes';
import MessageQueue, { MessageTypes } from '../display/message-handler';
import { Items as Glyphs } from '../constants/glyphs';
import Materials from '../constants/materials';
import { rarity, material } from '../constants/decorators';

class Equipment extends Item {
}

export class Special extends Item {}

@material(Materials.Food)
export class Comestible extends Item {
  constructor(opts = {}) {
    opts.autoRemove = true;
    opts.symbol = Glyphs.Comestible;
    super(opts);
    this.canStack = true;
  }
}

export class Armor extends Equipment {}

export class Weapon extends Equipment {
  constructor(opts) {
    super(opts);
    this.realName = this.fakeName = this.getCanonName();
  }
}

@rarity(25)
export class Body extends Armor {
  constructor(opts = {}) {
    opts.symbol = Glyphs.Body;
    super(opts);
    this.realName = this.fakeName = this.getCanonName();
  }
}

@rarity(3)
export class Ring extends Armor {
  constructor(opts = {}) {
    opts.bucProb = { cursed: 7, blessed: 2, uncursed: 91 };
    opts.symbol = Glyphs.Ring;
    super(opts);
    this.realName = `${this.getCanonName()}`;
    this.fakeName = `${this.pickFakeName(Fakes.Ring)} ring`;
  }
}

@rarity(25)
export class Hands extends Weapon {
  constructor(opts = {}) {
    opts.symbol = Glyphs.Hands;
    super(opts);
    this.realName = this.fakeName = this.getCanonName();
  }
}

@rarity(5)
export class Wrist extends Armor {
  constructor(opts = {}) {
    opts.symbol = Glyphs.Wrist;
    super(opts);
    this.realName = this.fakeName = this.getCanonName();
  }
}

@rarity(5)
export class Feet extends Armor {
  constructor(opts = {}) {
    opts.symbol = Glyphs.Feet;
    super(opts);
    this.realName = this.fakeName = this.getCanonName();
    this.slotsTaken = 2;
  }
}

@rarity(5)
export class Head extends Armor {
  constructor(opts = {}) {
    opts.symbol = Glyphs.Head;
    super(opts);
    this.realName = this.fakeName = this.getCanonName();
  }
}

@rarity(3)
export class Cloak extends Armor {
  constructor(opts = {}) {
    opts.symbol = Glyphs.Cloak;
    super(opts);
    this.realName = this.fakeName = this.getCanonName();
  }
}

@rarity(1)
export class Neck extends Armor {
  constructor(opts = {}) {
    opts.symbol = Glyphs.Neck;
    super(opts);
    this.realName = this.fakeName = this.getCanonName();
  }
}

@rarity(0) // actually a value of 8 but they're not implemented yet
@material(Materials.Glass)
export class Gem extends Item {
  constructor(opts = {}) {
    opts.symbol = Glyphs.Gem;
    super(opts);
    this.realName = this.fakeName = `${this.getCanonName()}`;
    this.canStack = true;
  }
}

@rarity(0) // actually a value of 15 but they're not implemented yet
@material(Materials.Cloth)
export class Scroll extends Item {
  constructor(opts = {}) {
    opts.symbol = Glyphs.Scroll;
    super(opts);
    this.realName = this.fakeName = `${this.getCanonName()}`;
    this.canStack = true;
  }
}

@rarity(2)
@material(Materials.Wood)
export class Wand extends Weapon {
  constructor(opts = {}) {
    opts.symbol = Glyphs.Wand;
    super(opts);
    this.realName = this.fakeName = this.getCanonName();
  }
}

@rarity(1)
@material(Materials.Cloth)
export class Spellbook extends Weapon {
  constructor(opts = {}) {
    opts.manaCost = opts.manaCost || 3;
    opts.symbol = Glyphs.Spellbook;
    super(opts);
  }
}

@rarity(20)
@material(Materials.Glass)
export class Potion extends Equipment {
  constructor(opts = {}) {
    opts.symbol = Glyphs.Potion;
    super(opts);
    this.realName = `potion of ${this.getCanonName()}`;
    const fake = this.pickFakeName(Fakes.Potion);
    this.color = fake;
    this.fakeName = `${fake} potion`;
    this.canStack = true;
  }
  use(entity, extra) {
    super.use(entity, extra);
    MessageQueue.add({ message: `${entity.name} drank ${this.color} liquid and ${extra.messageFinish}!`, type: MessageTypes.DUNGEON });
  }
}

@rarity(0)
@material(Materials.Iron)
export class Tool extends Item {
  constructor(opts = {}) {
    opts.symbol = Glyphs.Tool;
    super(opts);
  }
}
