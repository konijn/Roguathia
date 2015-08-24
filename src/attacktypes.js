
import GameState from "./gamestate";
import MessageQueue from "./message-handler";
import Abstract from "./abstract";
import Glyph from "./glyph";

let defaultRollOptions = {
  roll: '1d1',
  toHit: '0d0',
  range: 1
};

export class Attack extends Abstract {
  
  constructor(roll = '1d1', toHit = '0d0', range = 1) {
    super();
    this.roll = roll;
    this.toHit = toHit;
    this.range = range;
    if(this.init) this.init();
  }
  
  inRange(owner, target) { 
    return owner.distBetween(target) <= this.range;
  }
  
  possibleTargets(owner) {
    let possibleTargets = [];
    GameState.world.fov[owner.z].compute(
      owner.x, owner.y, this.range, 
      (x, y, radius, visibility) => {
        let entity = GameState.world.getEntity(x, y, owner.z);
        if(!entity || !owner.canAttack(entity)) return;
        possibleTargets.push(entity);
      }
    );
    return possibleTargets;
  }
  
  canUse(owner) { return this.possibleTargets(owner).length > 0; }
  
  canHit(owner, target, attackNum) {
    if(owner.hp.atMin()) return false;
    let hitRoll = +dice.roll(`1d2${attackNum}`); //subsequent attacks are less likely to hit
    let targetAC = target.getAC();
    let myToHitBonus = (+dice.roll(this.toHit) - owner.getToHit() - (this._itemRef ? this._itemRef.buc-1 : 0)); // cursed: -2, uncursed: 0, blessed: +1
    let targetACRoll = 0;

    if(targetAC >= 0) {
      targetACRoll = targetAC + owner.level - myToHitBonus;
    } else {
      targetACRoll = 10 + ROT.RNG.getUniformInt(targetAC, -1) + owner.level - myToHitBonus;
    }
    return hitRoll < targetACRoll;
  }
  
  animate(owner, target, callback) {
    if(!this.glyph) return callback();
    
    var engine = GameState.game.engine;
    engine.lock();
    
    let canPass = (x, y) => {
      let entity = GameState.world.getEntity(x, y, owner.z);
      let isAttackable = entity && owner.canAttack(entity);
      let isMe = owner.x === x && owner.y === y;
      return GameState.world.isTilePassable(x, y, owner.z, false) || isMe || isAttackable;
    };
    let astar = new ROT.Path.AStar(target.x, target.y, canPass, {topology: 8});

    let path = [];
    let pathCallback = function(x, y) {
        path.push({x, y});
    };
    
    astar.compute(owner.x, owner.y, pathCallback);

    path.shift();
    
    let projectile = new Projectile(this.glyph);
    projectile.z = owner.z;
    projectile.x = path[0].x;
    projectile.y = path[0].y;
    
    let moveTo = (x, y) => {
      GameState.world.moveEntity(projectile, x, y, projectile.z);
      GameState.game.refresh();
    };
    
    let finalize = () => {
      GameState.world.removeEntity(projectile);
      callback();
      GameState.game.refresh();
      engine.unlock();
    };
    
    moveTo(projectile.x, projectile.y);
    
    _.each(path, (step, i) => {
      let curStep = step;
      setTimeout(() => {
        moveTo(curStep.x, curStep.y);
        if(i === path.length - 1) finalize();
      }, i*50);
    });
  }
  
  tryHit(owner, target, attackNum) {
    if(!target) return;
    if(this._itemRef) this._itemRef.use(owner, target);
    if(!this.canHit(owner, target, attackNum)) {
      let extra = this.missCallback(owner, target);
      MessageQueue.add({message: this.missString(owner, target, extra)});
      return false;
    }
    this.animate(owner, target, () => this.hit(owner, target));
  }
  
  calcDamage(owner, target) {
    return +dice.roll(this.roll) + owner.calcStatBonus('str') + (this._itemRef ? this._itemRef.enchantment : 0);
  }
  
  hit(owner, target) {
    let damage = this.calcDamage(owner, target);
    if(damage <= 0) {
      let extra = this.blockCallback(owner, target);
      MessageQueue.add({message: this.blockString(owner, target, extra)});
      return false;
    }
    let extra = this.hitCallback(owner, target, damage);
    MessageQueue.add({message: this.hitString(owner, target, damage, extra)});
    target.takeDamage(damage, owner);
  }
  
  hitString(owner, target, damage) { return `${owner.name} hit ${target.name} for ${damage} damage!`; }
  hitCallback() {}
  
  blockString(owner, target) { return `${target.name} blocked ${owner.name}'s attack!`; }
  blockCallback() {}
  
  missString(owner, target) { return `${owner.name} missed ${target.name}!`; }
  missCallback() {}
  
  toJSON() {
    let me = _.omit(this, ['_itemRef']);
    return JSON.stringify(me);
  }
}

export class Projectile {
  constructor(glyph) {
    this.glyph = glyph;
  }
}