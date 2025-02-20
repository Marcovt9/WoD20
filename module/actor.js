import {
  DiceRollerDialogue
} from "./dialogue-diceRoller.js";
/**
 * Override and extend the basic :class:`Actor` implementation
 */
export class ActorMtA extends Actor {

  /* -------------------------------------------- */
  /*	Data Preparation														*/
  /* -------------------------------------------- */

  /**
   * Augment the basic Actor data model with additional dynamic data.
   */
  prepareData() {
    super.prepareData();
    

    // Get the Actor's data object
    const systemData = this.system;

    if(!systemData.derivedTraits) systemData.derivedTraits = {
      speed: {value: 0, mod: 0},
      armor: {value: 0, mod: 0},
      ballistic: {value: 0, mod: 0},
      initiativeMod: {value: 0, mod: 0},
      perception: {value: 0, mod: 0},
      health: {value: 0, mod: 0}
    };

    if(!systemData.combat_traits) systemData.combat_traits = {
      dodge_dv: {value: 0, mod: 0},
      parry_dv: {value: 0, mod: 0},
      dv_penalty: {value: 0, mod: 0}
    };

    if(!systemData.epic_attributes) systemData.epic_attributes = {
      epic_strength: {value: 0},
      epic_charisma: {value: 0},
      epic_perception: {value: 0},
      epic_dexterity: {value: 0},
      epic_manipulation: {value: 0},
      epic_intelligence: {value: 0},
      epic_stamina: {value: 0},
      epic_appearance: {value: 0},
      epic_wits: {value: 0}
    };

    //Get modifiers from items
    let item_mods = this.items.reduce((acc, item) => {
      if (item.system.equipped) {
        if (item.system.initiativeMod) acc.initiativeMod += item.system.initiativeMod;
        if (item.type === "armor") acc.armor += item.system.rating;
        if (item.type === "armor") acc.ballistic += item.system.ballistic;
        if (item.system.speedPenalty) acc.speed -= item.system.speedPenalty;
      }
      return acc;
    }, {
      initiativeMod: 0,
      speed: 0,
      armor: 0,
      ballistic: 0
    });

    let attributes = [];
    if (this.type === "character") {
      attributes = [
        systemData.attributes_physical, 
        systemData.attributes_mental, 
        systemData.attributes_social,
        systemData.skills_physical, 
        systemData.skills_social, 
        systemData.skills_mental, 
        systemData.derivedTraits,
        systemData.vampire_traits,
        systemData.scion_traits
      ];
    }
    
    attributes.forEach(attribute => Object.values(attribute).forEach(trait => {
      //if(trait == undefined) console.warn("Null attribute found", attribute, this.name)
      if(trait == undefined) trait = {};
      if(typeof trait != 'string'){ // Quick fix for a mistake I made for dream stats
        trait.final = trait.value;
        trait.raw = undefined;
        trait.isModified = false;
      };

      if(typeof trait == 'number') trait = {}; // Quick fix for a mistake I made for dream stats

    }));

    const der = systemData.derivedTraits;
    const DV = systemData.combat_traits;

    let derivedTraitBuffs = [];
    let itemBuffs = [];

    //Get effects from items (modifiers to any attribute/skill/etc.)
    for (let i of this.items) {
      if (i.system?.effects && (i.system?.effectsActive || i.system?.equipped)) { // only look at active effects
        if(i.type === "form" && this.system.characterType !== "Werewolf") continue; // Forms only work for werewolves
        itemBuffs = itemBuffs.concat(i.system.effects);
      }
    }

    itemBuffs.filter( e => e.name.split('.')[0] !== "derivedTraits" ).sort( (a,b) => (b.value<0)-(a.value<0) || (!!a.overFive)-(!!b.overFive) ).forEach( e => {
      const trait = e.name.split('.').reduce((o,i) => {
        if(o != undefined && o[i] != undefined) return o[i];
        else return undefined;
      }, systemData);
      if(trait != undefined) {
        if(typeof trait == 'number') {
          if(ui?.notifications) ui.notifications.warn(`CofD: The trait does not support the effect system at the moment: ${e.name}`);
          console.warn("CofD: The trait does not support the effect system at the moment. " + e.name);
          return;
        }
        const newVal = (Number.isInteger(trait.raw) ? trait.raw : trait.value ) + e.value;
        trait.raw = e.overFive  ?  newVal  :  Math.min( newVal, Math.max(trait.value, this.getTraitMaximum()) );
        trait.final = Math.clamped(trait.raw, 0, Math.max(trait.value,CONFIG.MTA.traitMaximum));
        trait.isModified = true;
      }
      else {
        if(ui?.notifications) ui.notifications.warn(`CofD: The trait does not support the effect system at the moment: ${e.name}`);
        console.warn("CofD: The trait does not support the effect system at the moment. " + e.name, this.name);
        return;
      }
    });  
    derivedTraitBuffs.push(...itemBuffs.filter( e => e.name.split('.')[0] === "derivedTraits" ));

    // Compute derived traits
    let epic_str = 0, epic_dex = 0, epic_sta = 0, epic_cha = 0, epic_man = 0, epic_app = 0, epic_per = 0, epic_int = 0, epic_wit = 0;
    if (this.system.characterType == "Scion"){
      epic_str =systemData.epic_attributes.epic_strength.value;
      epic_dex =systemData.epic_attributes.epic_dexterity.value;
      epic_sta =systemData.epic_attributes.epic_stamina.value;
      epic_cha =systemData.epic_attributes.epic_charisma.value;
      epic_man =systemData.epic_attributes.epic_manipulation.value;
      epic_app =systemData.epic_attributes.epic_appearance.value;
      epic_per =systemData.epic_attributes.epic_perception.value;
      epic_int =systemData.epic_attributes.epic_intelligence.value;
      epic_wit =systemData.epic_attributes.epic_wits.value;
    } 

    if (this.type === "character") {
      const str = systemData.attributes_physical.strength.final + epic_str;
      const dex = systemData.attributes_physical.dexterity.final + epic_dex;
      const sta = systemData.attributes_physical.stamina.final + epic_sta;
      const cha = systemData.attributes_social.charisma.final + epic_sta;
      const man = systemData.attributes_social.manipulation.final + epic_sta;
      const app = systemData.attributes_social.appearance.final + epic_sta;
      const per = systemData.attributes_mental.perception.final + epic_per;
      const int  = systemData.attributes_mental.intelligence.final + epic_int;
      const wit = systemData.attributes_mental.wits.final + epic_wit;
      const awr = systemData.skills_physical.awareness.final;
      const ath = systemData.skills_physical.athletics.final;
      const bra = systemData.skills_physical.brawl.final;
      const mel = systemData.skills_mental.melee.final;
      
      DV.dv_penalty.value = systemData.age;
      DV.dodge_dv.value = dex + ath;
      DV.parry_dv.value = Math.ceil( (dex + Math.max(bra, mel) ) / 2) - DV.dv_penalty.value;

      if (this.system.characterType == "Scion"){
        this.system.scion_traits.legend_points.max = this.system.scion_traits.legend.value * 2;
        DV.dodge_dv.value = DV.dodge_dv.value + this.system.scion_traits.legend.value;
      }
      
      DV.dodge_dv.value = Math.ceil(DV.dodge_dv.value / 2) - DV.dv_penalty.value;



      der.speed.value = (6 + dex) * 2;
      der.initiativeMod.value = awr + wit;
      der.health.value = systemData.attributes_physical.stamina.value;
      der.perception.value = per + awr;
    }



    der.armor.value = der.armor.mod + item_mods.armor;
    der.ballistic.value += der.ballistic.mod + item_mods.ballistic;

    der.speed.value += der.speed.mod + item_mods.speed;
    der.initiativeMod.value += der.initiativeMod.mod + item_mods.initiativeMod;
    der.perception.value += der.perception.mod;
    der.health.value += der.health.mod;

    [systemData.derivedTraits].forEach(attribute => Object.values(attribute).forEach(trait => {
      trait.final = trait.value;
      trait.raw = undefined;
      trait.isModified = false;
    }));

    // Apply derived Traits buffs
    derivedTraitBuffs.forEach(e => {
      const trait = e.name.split('.').reduce((o,i)=> o[i], systemData);
      trait.raw = Number.isInteger(trait.raw) ?  trait.raw + e.value : trait.value + e.value;
      trait.final = Math.max(trait.raw, 0);
      trait.isModified = true;
    });

    der.speed.final = Math.max(0, der.speed.final);
    der.armor.final = Math.max(0, der.armor.final);
    der.ballistic.final = Math.max(0, der.ballistic.final);
    der.initiativeMod.final = Math.max(0, der.initiativeMod.final);
    der.perception.final = Math.max(0, der.perception.final);
  }

  /* -------------------------------------------- */
  /*  Socket Listeners and Handlers
  /* -------------------------------------------- */

  /** @override */
  _preCreate(data, user) {
    super._preCreate(data, user);

    const tokenUpdateData = {};
    if (data.prototypeToken?.actorLink === undefined) {
      tokenUpdateData["actorLink"] = true;
    }

    if (!foundry.utils.isEmpty(tokenUpdateData)) this.prototypeToken.updateSource(tokenUpdateData);
  }



  /** @override */
  static async create(data, options = {}) {
    const actor = await super.create(data, options);
      
    return actor;
  }

  /**
   * Rolls a set of dice and calculates a result based on the provided traits and bonuses.
   *
   * @param {object} params - The parameters for the roll.
   * @param {string[]} [params.traits=[]] - An array of strings in the format "<trait-group>.<trait>", e.g. ["attributes_physical.strength", "skills_social.persuasion"])..
   * @param {number} [params.diceBonus=0] - A bonus to add to the dice roll.
   * @param {string} [params.rollName="Skill check"] - The name of the roll.
   * @param {string} [params.rollType="dialogue"] - The type of roll, either "dialogue" or "quick".
   *
   * @returns {number} The result of the roll.
   */
  roll({traits=[], diceBonus=0, rollName="Skill check", rollType="dialogue", damageRoll=false}) {

    const {dicePool, flavor} = this.assembleDicePool({traits, diceBonus});

    switch(rollType) {
      case 'dialogue':
        let title = "";
        title = rollName + ": " + flavor;
        let diceRoller = new DiceRollerDialogue({dicePool, flavor: title, addBonusFlavor: true, title, actorOverride: this.actor});
        diceRoller.render(true);
        break;
      case 'quick':
        DiceRollerDialogue.rollToChat({
          dicePool,
          flavor,
          actorOverride: this.actor
        });
        break;
      default:
        return {flavor, dicePool};
    }
    // TODO: Return result of the roll  
  }

  
  /**
   * Assembles a dice pool from an array of traits into a concrete number,
   * alongside the flavor text describing the assembled dice pool.
   *
   * @param {object} params - The parameters for the roll.
   * @param {string[]} [params.traits=[]] - An array of strings in the format "<trait-group>.<trait>", e.g. ["attributes_physical.strength", "skills_social.persuasion"])..
   * @param {number} [params.diceBonus=0] - A bonus to add to the dice roll.
   *
   * @returns {object} An object containing a dice pool and a flavor string.
   * @property {number} dicePool - The assembled dice pool as a number.
   * @property {string} flavor - A string representing the contents of the dice pool.
   */
  assembleDicePool({traits=[], diceBonus=0}) {
    const systemData = this.system;
    
    //Get dice pool
    let dicePool = 0;
    let flavor = "";
    
    if(traits.length > 0){
      // Get dice pool according to the item's dice pool attributes from the actor
      let diceFromTraits = traits ? traits.reduce((acc, cur) => {
        
        let ret = 0;
        let flv = "";
        ret = cur.split('.').reduce((o,i) => {
          if(o != undefined && o[i] != undefined) return o[i];
          else return undefined;
        }, systemData);

        if(!Number.isInteger(ret)) {
          if(typeof ret.max == 'number') ret = ret.max; // E.g. Willpower, ..
          else if(typeof ret.final == 'number') ret = ret.final;
          else if(typeof ret.value == 'number') ret = ret.value;
          else {
            ret = 0;
            console.warn("CofD: A roll attribute could not be resolved. " + cur);
          }
        }
        if(cur.split('.')[0] === "disciplines_own") flv = cur.split('.').reduce((o,i)=> o[i], systemData).label;
        else flv = game.i18n.localize("MTA." + cur);

        if(flavor) flavor += " + " + flv;
        else flavor = flv;
        return acc + ret;
      }, 0) : 0;
      dicePool += diceFromTraits;
    }
    else flavor = "Skill Check";
    if(diceBonus) {
      dicePool += diceBonus;
      flavor += diceBonus >= 0 ? ' (+' : ' ('; 
      flavor += diceBonus + ' bonus)';
    }

    let woundPenalty = this.getWoundPenalties();
    
    if(woundPenalty > 0) {
      dicePool -= woundPenalty;
      flavor += " (Wound penalties: -" + woundPenalty + ")";
    }

    return {dicePool, flavor};
  }

  
  /**
   * @deprecated
   * This function returns the actual, modified value for any attribute or skill.
   * and should be used whenever someone rolls.
   * Final is the modified trait, and value is the base.
   * Do not use this for derived traits! They do not have value or final fields.
   */
  static getTrait(trait){
    console.warn("CofD system: The getTrait() function has been deprecated. Please simply use trait.final instead.")
    return trait.final;
  }

  /** Returns the attribute limit of the character (e.g. Gnosis for mages) **/
  getTraitMaximum() {
    const data = this.system;
  
    const powerStats = { //TODO: Put in config
      Mortal: 5,
      Scion: 5,
      Vampire: data.vampire_traits.bloodPotency?.final
    };
    if(!powerStats[data.characterType]) {
      return 5;
    }
    return Math.max(5,powerStats[data.characterType]);
  }

  /**
   * Executes a perception roll using Composure + Wits.
   * if hidden is set, the roll is executed as a blind GM roll.
   */
  rollPerception(quickRoll, hidden, actorOverride) {
    const data = this.system;
    let dicepool = data.derivedTraits.perception.final;
    let flavor = "Perception";
    if (quickRoll) DiceRollerDialogue.rollToChat({
      dicePool: dicepool,
      flavor: flavor,
      title: flavor,
      blindGMRoll: hidden,
      actorOverride: actorOverride
    });
    else {
      let diceRoller = new DiceRollerDialogue({
        dicePool: dicepool,
        flavor: flavor,
        title: flavor,
        addBonusFlavor: true,
        blindGMRoll: true,
        actorOverride: actorOverride
      });
      diceRoller.render(true);
    }
  }


  damage(damageAmount, damagetype) {
    if(damageAmount === 0) return;
    console.log("Damaging " + this.name + " by " + damageAmount + " " + damagetype + " damage");
    if(damagetype === "bashing") damagetype = "value"
    
    if(this.system.health[damagetype] != undefined) {
      let updateData = {};
      if(damageAmount > 0) {
        if(damagetype === 'aggravated') {
          updateData[`data.health.aggravated`] = Math.max(0, this.system.health.aggravated - damageAmount);
          updateData[`data.health.lethal`] = Math.max(0, this.system.health.lethal - damageAmount);
          updateData[`data.health.value`] = Math.max(0, this.system.health.value - damageAmount);
        }
        else if(damagetype === 'lethal') {
          let carryOver_aggravated = - Math.min(0, this.system.health.lethal - damageAmount);
          
          if(carryOver_aggravated > 0) updateData[`data.health.aggravated`] = Math.max(0, this.system.health.aggravated - carryOver_aggravated);
          updateData[`data.health.lethal`] = Math.max(0, this.system.health.lethal - damageAmount);
          updateData[`data.health.value`] = Math.max(0, this.system.health.value - damageAmount);
        }
        else if(damagetype === 'value') {
          let carryOver_lethal = - Math.min(0, this.system.health.value - damageAmount);
          let carryOver_aggravated = - Math.min(0, this.system.health.lethal - carryOver_lethal);

          if(carryOver_aggravated > 0) updateData[`data.health.aggravated`] = Math.max(0, this.system.health.aggravated - carryOver_aggravated);
          if(carryOver_lethal > 0) updateData[`data.health.lethal`] = Math.max(0, this.system.health.lethal - damageAmount);
          updateData[`data.health.value`] = Math.max(0, this.system.health.value - damageAmount);
        }
      }
      else { // Negative damage == healing
        if(damagetype === 'value') updateData[`data.health.value`] = Math.min(this.system.health.lethal, this.system.health.value - damageAmount);
        else if(damagetype === 'lethal') {
          updateData[`data.health.lethal`] = Math.min(this.system.health.aggravated, this.system.health.lethal - damageAmount);
          updateData[`data.health.value`] = Math.min(updateData[`data.health.lethal`], this.system.health.value - damageAmount);
        }
        else if(damagetype === 'aggravated') {
          updateData[`data.health.aggravated`] = Math.min(this.system.health.max, this.system.health.aggravated - damageAmount);
          updateData[`data.health.lethal`] = Math.min(updateData[`data.health.aggravated`], this.system.health.lethal - damageAmount);
          updateData[`data.health.value`] = Math.min(updateData[`data.health.lethal`], this.system.health.value - damageAmount);
        }
      }

      this.update(updateData);
    }
  }

  getWoundPenalties() {
    const systemData = this.system;
    let woundPenalty = 0;
    let agg = systemData.health.max - systemData.health.aggravated;
    let lethal = systemData.health.max - systemData.health.lethal - agg;
    // let bashing = systemData.health.max - lethal - systemData.health.value;

    if(agg + lethal >= systemData.health.max * 0.8){
      woundPenalty = -4;
    }
    else if(agg + lethal >= systemData.health.max * 0.5){
      woundPenalty = -2;
    }
    else if(agg + lethal >= systemData.health.max * 0.2){
      woundPenalty = -1;
    }

    return woundPenalty;
  }

  /**
   * Calculates and sets the maximum health for the actor using the formula
   * Stamina.
   * If health is set lower than any damage, the damage is lost.
   */
  calculateAndSetMaxHealth() {
    const system = this.system;
    const maxHealth_old = system.health.max;
    let maxHealth = system.derivedTraits.health.value;
    //if(data.characterType === "Vampire") maxHealth += data.disciplines.common.resilience.value;
    if(system.characterType === "Scion") maxHealth = 7 + system.scion_traits.legend.value;

    let diff = maxHealth - maxHealth_old;
    if(diff === 0) return;

    let updateData = {}
    updateData['system.health.max'] = maxHealth;
    
    if (diff >= 0) { // New health is more than old
      updateData['system.health.lethal'] = (+system.health.lethal + diff);
      updateData['system.health.aggravated'] = (+system.health.aggravated + diff);
      updateData['system.health.value'] = (+system.health.value + diff);
    } else { // New health is less than old
      updateData['system.health.lethal'] = Math.max(0, (+system.health.lethal + diff));
      updateData['system.health.aggravated'] = Math.max(0, (+system.health.aggravated + diff));
      updateData['system.health.value'] = Math.max(0, (+system.health.value + diff));

      if(system.health.lethal < Math.abs(diff)) { // Too much lethal damage, upgrade lethal to aggravated damage.
        updateData['system.health.aggravated'] = Math.max(0, updateData['system.health.aggravated'] - Math.abs(Math.abs(diff) - system.health.lethal));
      }

      let diffBashing = Math.max(0, Math.abs(diff) - system.health.value);
      if(system.health.lethal < Math.abs(diff)) diffBashing -= Math.abs(Math.abs(diff) - system.health.lethal);
      if(diffBashing > 0) { // Too much bashing damage, upgrade bashing to lethal, or lethal to aggravated damage.
        updateData['system.health.lethal'] -= diffBashing;
        if(updateData['system.health.lethal'] < 0) {
          updateData['system.health.aggravated'] = Math.max(0, updateData['system.health.aggravated'] + updateData['system.health.lethal']);
          updateData['system.health.lethal'] = 0;
        }
      }
    }
    this.update(updateData);
  }

  /**
   * Calculates and sets the maximum splat-specific resource for the actor.
   * Mage: Mana (determined by Gnosis)
   * Vampire: Vitae (determined by Blood Potency)
   */
  calculateAndSetMaxResource() {
    const system = this.system;
      if (system.characterType === "Vampire") { // Vitae
      let maxResource = CONFIG.MTA.bloodPotency_levels[Math.min(10, Math.max(0, system.vampire_traits.bloodPotency.final))].max_vitae;
      if (system.vampire_traits.bloodPotency.final < 1) maxResource = system.attributes_physical.stamina.final

      let obj = {}
      obj['system.vitae.max'] = maxResource;
      this.update(obj);
    }

    if (system.characterType == "Scion") { // Leyenda
      let maxResource = CONFIG.MTA.legend * CONFIG.MTA.legend;

      let obj = {}
      obj['system.legendPoints.max'] = maxResource;
      this.update(obj);
    }

  }
}