
import ROT from 'rot-js';
import Behavior, { Priority } from '../../definitions/behavior';
import GameState from '../../init/gamestate';

/* monsters can attack with this */
class AttacksBehavior extends Behavior {
  constructor() { super(Priority.DEFENSE); }
  act(me) {
    return !me.tryAttack();
  }
}

export const Attacks = () => new AttacksBehavior();

class TeleportsWhenHitBehavior extends Behavior {
  constructor(percent = 100) {
    super(Priority.DEFER);
    this.percent = percent;
  }
  takeDamage(me) {
    if(ROT.RNG.getPercentage() > this.percent) return;
    GameState.world.placeEntityAtRandomLocation(me);
  }
}

export const TeleportsWhenHit = (percent) => new TeleportsWhenHitBehavior(percent);