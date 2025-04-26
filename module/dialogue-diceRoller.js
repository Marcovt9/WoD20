/*Dice Roller para Scion*/

export class DiceRollerDialogue extends Application {
  constructor({dicePool=0, target_successes=0, penalty=0, flavor="Tirada", addBonusFlavor=false, title="Tirada", blindGMRoll=false, actorOverride=undefined, damageRoll=false, weaponDamage=0, armorPiercing=0, itemName="", itemImg="", itemRef=undefined, itemDescr="", spendAmmo=false, macro, actor={}, token={}, comment="", autoSuccess=0}, ...args){
    super(...args);
    this.dicePool = +dicePool;
    this.penalty = penalty;
    this.flavor = flavor;
    this.addBonusFlavor = addBonusFlavor;
    this.blindGMRoll = blindGMRoll;
    this.options.title = title;
    this.actorOverride = actorOverride;
    this.damageRoll = damageRoll;
    this.weaponDamage = weaponDamage;
    this.armorPiercing = armorPiercing;
    this.itemName = itemName;
    this.itemImg = itemImg;
    this.itemRef = itemRef;
    this.itemDescr = itemDescr;
    this.spendAmmo = spendAmmo;
    this.target_successes = target_successes;
    this.macro = macro;
    this.actor = actor;
    this.token = token;
    this.comment = comment;
    this.autoSuccess = +autoSuccess;
  }

  /* -------------------------------------------- */

  /**
   * Extend and override the default options used by the 5e Actor Sheet
   * @returns {Object}
   */
	static get defaultOptions() {
	  return foundry.utils.mergeObject(super.defaultOptions, {
  	  classes: ["worldbuilding", "dialogue", "mta-sheet"],
  	  template: "systems/WoD20/templates/dialogues/dialogue-diceRoller.html",
      resizable: true
    });
  }
  
  getData() {
    const data = super.getData();
    data.dicePool = this.dicePool;
    data.bonusDice = 0;
    data.spendAmmo = this.spendAmmo;
    data.ammoPerShot = 1;
    data.penalty = this.penalty;
    data.autoSuccess = this.autoSuccess;
    
    if(game.settings.get("mta", "showRollDifficulty")) data.enableDifficulty = true;

    return data;
  }
  
  _fetchInputs(html){
    const dicePool_userMod_input = html.find('[name="dicePoolBonus"]');
    const autoSuccess_userMod_input = html.find('[name="autoSuccess"]');
    const dicePool_difficulty_input = html.find('[name="dicePoolDifficulty"]');
    const ammoPerShot_input = html.find('[name="ammoPerShot"]');
    
    let dicePool_userMod = dicePool_userMod_input.length ? +dicePool_userMod_input[0].value : 0;
    let autoSuccess_userMod = autoSuccess_userMod_input.length? + autoSuccess_userMod_input[0].value : 0;

    let dicePool_difficulty 
    if(game.settings.get("mta", "showRollDifficulty")) dicePool_difficulty = dicePool_difficulty_input.length ? +dicePool_difficulty_input[0].value : 0;
    else dicePool_difficulty = 6;

    let ammoPerShot = ammoPerShot_input.length ? +ammoPerShot_input[0].value : 0;
    
    return {dicePool_userMod: dicePool_userMod, autoSuccess_userMod: autoSuccess_userMod, dicePool_difficulty: dicePool_difficulty, ammoPerShot: ammoPerShot}
  }
  
  activateListeners(html) {
    super.activateListeners(html);
    
    html.find('.roll-execute').click(ev => this._executeRoll(html, ev));
  }
  
  async _executeRoll(html, ev) {
    const modifiers = this._fetchInputs(html);
    const dicePool = modifiers.dicePool_userMod;
    const autoSuccess = modifiers.autoSuccess_userMod;
    const flavor = (this.flavor || "Tirada")
                 + (modifiers.dicePool_userMod>0 ? " + " + modifiers.dicePool_userMod : modifiers.dicePool_userMod<0 ? " - " + -modifiers.dicePool_userMod : "");
    const rollReturn = {};
    if(this.damageRoll) await DiceRollerDialogue.rollWithDamage({dicePool: dicePool, autoSuccess: autoSuccess, rollReturn: rollReturn, flavor: flavor, blindGMRoll: this.blindGMRoll, actorOverride: this.actorOverride, weaponDamage: this.weaponDamage, armorPiercing: this.armorPiercing, itemImg: this.itemImg, itemName: this.itemName, itemRef: this.itemRef, itemDescr: this.itemDescr, spendAmmo: this.spendAmmo, ammoPerShot: modifiers.ammoPerShot, comment: this.comment});
    else await DiceRollerDialogue.rollToChat({dicePool: dicePool, autoSuccess: autoSuccess, rollReturn: rollReturn, flavor: flavor, blindGMRoll: this.blindGMRoll, actorOverride: this.actorOverride, comment: this.comment});
  
    if (this.macro) {
      this.actor.setFlag('mta', 'rollReturn', rollReturn.roll);
      this.macro.execute({actor: this.actor, token: this.actor.token ?? this.actor.getActiveTokens[0]});
    }
  }
  
  static async _roll({dicePool=1, autoSuccess=0, exceptionalTarget=5}){
    //Create dice pool qualities
    const targetNumString =  "cs>="+ 7;

    let roll = new Roll(dicePool + "d10" + targetNumString);
    await roll.evaluate();
    //Especialización
    for (let i = 0; i <  roll.terms[0].number; i++) {
        if (roll.terms[0].results[i].result === 10) {
              roll._total = roll._total+ 1;
        }
    }
  
    roll._total = roll._total + autoSuccess;
    if(roll.total >= exceptionalTarget) roll.exceptionalSuccess = true;

    console.log(roll);
    return roll;
  }
  

  static async rollToHtml({dicePool=1, autoSuccess= 0, flavor="Tirada", showFlavor=true, exceptionalTarget=5, blindGMRoll=false, rollReturn, comment=""}){   
    
    let roll = await DiceRollerDialogue._roll({dicePool: dicePool, autoSuccess: autoSuccess, exceptionalTarget: exceptionalTarget});
    if(rollReturn) rollReturn.roll = roll;
    //Create Roll Message
    let speaker = ChatMessage.getSpeaker();
    
    if(!showFlavor) flavor = undefined;

    let chatData = {
      user: game.user.id,
      speaker: speaker,
      flavor: flavor
    };
    let rollMode = blindGMRoll ? "blindroll" : game.settings.get("core", "rollMode");
    chatData = ChatMessage.applyRollMode(chatData, rollMode);
    
    let html = await roll.render(chatData);
    if(roll.dramaticFailure) html = html.replace('class="dice-total"', 'class="dice-total dramaticFailure"');
    else if(roll.exceptionalSuccess) html = html.replace('class="dice-total"', 'class="dice-total exceptionalSuccess"');

    if(comment) html += `<div class="comment">${comment.replaceAll('\n', '<br>')}</div>`;

    return html;
  }

  
  static async rollToChat({dicePool=1, autoSuccess=0, exceptionalTarget=5, flavor="Tirada", blindGMRoll=false, actorOverride=undefined, rollReturn={}, comment=""}){
    
    const templateData = {
      roll: await DiceRollerDialogue.rollToHtml({
        dicePool: dicePool, 
        autoSuccess: autoSuccess,
        exceptionalTarget: exceptionalTarget, 
        showFlavor: false,
        blindGMRoll: blindGMRoll,
        rollReturn: rollReturn,
        comment
      })
    };
    
    //Create Roll Message
    let rollMode = blindGMRoll ? "blindroll" : game.settings.get("core", "rollMode");
    let speaker = actorOverride ? ChatMessage.getSpeaker({actor: actorOverride}) : ChatMessage.getSpeaker();
    
    // Render the chat card template
    const template = `systems/WoD20/templates/chat/roll-template.html`;
    const html = await renderTemplate(template, templateData);

    // Basic chat message data
    let chatData = {
      user: game.user.id,
      type: CONST.CHAT_MESSAGE_TYPES.ROLL,
      content: html,
      speaker: speaker,
      flavor: flavor,
      sound: CONFIG.sounds.dice,
      roll: rollReturn.roll,
      rollMode: rollMode
    };

    // Toggle default roll mode
    chatData = ChatMessage.applyRollMode(chatData, rollMode);

    // Create the chat message
    return ChatMessage.create(chatData);
  }

  static async rollWithDamage({dicePool=1,
    exceptionalTarget=5, 
    flavor="Attack", 
    blindGMRoll=false, 
    actorOverride=undefined,
    itemImg = "",
    itemName = "",
    itemDescr = "",
    weaponDamage = 0,
    armorPiercing = 0,
    itemRef=undefined, // for reloading of firearms
    spendAmmo=false,
    ammoPerShot=0, 
    rollReturn={},
    comment="",
    autoSuccess=0
  }) {
    const templateData = {
      data: {
        description: itemDescr,
        rolls: [ {
          title: "Hit Roll",
          html: await DiceRollerDialogue.rollToHtml({
            dicePool: dicePool,  
            autoSuccess: autoSuccess, 
            exceptionalTarget: exceptionalTarget, 
            showFlavor: false,
            blindGMRoll: blindGMRoll,
            rollReturn: rollReturn, 
            comment
          })
        }],
      },
      item: {
        img: itemImg,
        name: itemName
      }
    };

    templateData.data.summary = rollReturn.roll.total ? (rollReturn.roll.total + weaponDamage) + " damage inflicted!": "Attack missed!"
    if(armorPiercing && rollReturn.roll.total) templateData.data.summary += " (" + armorPiercing + " AP)";
    if(spendAmmo) templateData.data.summaryAddendum = ammoPerShot + " ammo spent";

    if(spendAmmo && ammoPerShot) {
      if(itemRef) {
        if(!itemRef.system.magazine) {
          ui.notifications.error(`No magazine inside the weapon!`);
          return;
        }
        let ammo = itemRef.system.magazine.system.quantity;
        ammo -= ammoPerShot;
        if(ammo < 0) {
          ui.notifications.error(`Not enough ammo available inside the weapon to shoot!`);
          return;
        } else {
          itemRef.update({
            _id: itemRef.id,
            'system.magazine.system.quantity': ammo
          });
        }
      } else {
        ui.notifications.warn(`No weapon reference was given (no ammo subtracted).`);
      }
    }

    //Create Roll Message
    let rollMode = blindGMRoll ? "blindroll" : game.settings.get("core", "rollMode");
    let speaker = actorOverride ? ChatMessage.getSpeaker({actor: actorOverride}) : ChatMessage.getSpeaker();

    // Render the chat card template
    const template = `systems/WoD20/templates/chat/item-card.html`;
    const html = await renderTemplate(template, templateData);

     // Basic chat message data
     let chatData = {
      user: game.user.id,
      type: CONST.CHAT_MESSAGE_TYPES.ROLL,
      content: html,
      speaker: speaker,
      flavor: flavor,
      sound: CONFIG.sounds.dice,
      roll: rollReturn.roll,
      rollMode: rollMode
    };

    chatData = ChatMessage.applyRollMode(chatData,rollMode);
    // Create the chat message
    return ChatMessage.create(chatData);
  }
}