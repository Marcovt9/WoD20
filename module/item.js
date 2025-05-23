import {
  DiceRollerDialogue
} from "./dialogue-diceRoller.js";
import {
  ActorMtA
} from "./actor.js";
/**
 * Override and extend the basic :class:`Item` implementation
 */
export class ItemMtA extends Item {
  
  /* -------------------------------------------- */
  /*	Data Preparation														*/
  /* -------------------------------------------- */

  /**
   * Augment the basic Item data model with additional dynamic data.
   */
  prepareData() {
    super.prepareData(); //TODO: Put this functionality in where the item is initialised to avoid problems. Alternative: isImgInitialised flag
    if (!this.img || this.img === "icons/svg/item-bag.svg" || this.img.startsWith('systems/WoD20/icons/placeholders')){
    
      let img = 'systems/WoD20/icons/placeholders/item-placeholder.svg';
      let type = this.type;
      if(type === "melee"){
        if(this.system.weaponType === "Unarmed") type = "unarmed";
        else if(this.system.weaponType === "Thrown") type = "thrown";
      }
      
      img = CONFIG.MTA.placeholders.get(type);
      if(!img) img = 'systems/WoD20/icons/placeholders/item-placeholder.svg';

      this.img = img; 
    }
  }

  /* -------------------------------------------- */

  getRollTraits() {
    // FIXME: Currently this will only get the default traits if no dice bonus is defined.
    // Not sure if that is good behaviour..

    if(this.system.dicePool && (this.system.dicePool?.attributes?.length > 0 || this.system.dicePool.value)) { 
      return {traits: this.system.dicePool.attributes, diceBonus: this.system.dicePool.value};
    }
    const defaultTraits = { // TODO: Move this into Config?
      firearm: ["attributes_physical.dexterity", "skills_social.marksmanship"],
      melee: {
        Unarmed: ["attributes_physical.dexterity", "skills_physical.brawl"],
        Thrown: ["attributes_physical.dexterity", "skills_physical.athletics"],
        default: ["attributes_physical.dexterity", "skills_mental.melee"],
      },
      vehicle: ["attributes_physical.dexterity", "skills_physical.control"]
    };

    let traits = [];
  
    if (this.type in defaultTraits) {
      const typeData = defaultTraits[this.type];
      if (Array.isArray(typeData)) {
        traits = typeData;
      } else if (this.system.weaponType in typeData) {
        traits = typeData[this.system.weaponType];
      } else {
        traits = typeData.default;
      }
    }
  
    return {traits, diceBonus: 0};
  }

  isWeapon() {
    return this.type === "firearm" || this.type === "melee" || this.system.isWeapon;
  }

  async showChatCard() {
    const token = this.actor.token;
     const templateData = {
       item: this,
       actor: this.actor,
       tokenId: token ? `${token.object.scene.id}.${token.id}` : null, //token ? `${token.scene.id}.${token.id}` : null,
       isSpell: this.type === "spell",
       data: await this.getChatData()
     };
 
     // Render the chat card template
     const template = `systems/WoD20/templates/chat/item-card.html`;
     const html = await renderTemplate(template, templateData);
 
     // Basic chat message data
     const chatData = {
       user: game.user.id,
       type: CONST.CHAT_MESSAGE_STYLES.OTHER,
       content: html,
       speaker: ChatMessage.getSpeaker({actor: this.actor, token: this.actor.token}),
       flavor: ""
     };
     
     // Toggle default roll mode
     let rollMode = game.settings.get("core", "rollMode");
     if ( ["gmroll", "blindroll"].includes(rollMode) ) chatData["whisper"] = ChatMessage.getWhisperRecipients("GM");
     if ( rollMode === "blindroll" ) chatData["blind"] = true;
    ChatMessage.create(chatData);
  }

  async roll(target) {
    // TODO: Combine item description and roll

    this.showChatCard();

    if(!this.actor) {
      ui.notifications.error(`CofD: An item can only be rolled if an actor owns it!`);
      return;
    }

    if(!target) { // Infer a target from the selected targets
      const targets = game.user.targets;
      target = targets ? targets.values().next().value : undefined;
    }

    const {traits, diceBonus} = this.getRollTraits();

    let {dicePool, flavor, autoSuccess} = this.actor.assembleDicePool({traits, diceBonus});
    if(!flavor) flavor = "Skill Check";

    let extended = false,
    target_successes = 0,
    penalty = 0;

    if(this.system.diceBonus) {
      dicePool += this.system.diceBonus;
      flavor += this.system.diceBonus >= 0 ? ' (+' : ' ('; 
      flavor += this.system.diceBonus + ' equipment bonus)';
    }

    if(this.system.dicePool?.extended) {
      extended = true;
      if(this.system.dicePool.target_successes) target_successes = this.system.dicePool.target_successes;
    }

    const damageRoll = this.isWeapon();
    if(damageRoll) { // TODO: Put into another function?
      if(target) {
        flavor += " vs target " + target.name;
      }
    }

    let macro;
    if(this.system.dicePool?.macro) {
      macro = game.macros.get(this.system.dicePool.macro);
    }

    let diceRoller = new DiceRollerDialogue({
      dicePool, 
      extended, 
      target_successes,
      penalty,
      flavor, 
      addBonusFlavor: true, 
      title: this.name + " - " + flavor, 
      damageRoll, 
      itemName: this.name, 
      itemImg: this.img, 
      itemDescr: this.system.description, 
      itemRef: this, 
      weaponDamage: this.system.damage, 
      armorPiercing: this.system.penetration, 
      spendAmmo: this.type === "firearm", 
      actorOverride: this.actor,
      macro,
      actor: this.actor,
      token: this.actor.token,
      comment: this.system.dicePool?.comment,
      autoSuccess: autoSuccess
    });
    diceRoller.render(true);
  }
    
  /**
   * Prepare an object of chat data used to display a card for the Item in the chat log
   * @return {Object}               An object of chat data to render
   */
  async getChatData() {
    let secrets = this.isOwner;
    if (game.user.isGM) secrets = true;
    //enrichHTML(content, secrets, entities, links, rolls, rollData) → {string}

    const data = {
      description: TextEditor.enrichHTML(this.system.description, {secrets:secrets, entities:true, async: false})
    }

    return data;
  }
  
  /* -------------------------------------------- */
  /*  Chat Message Helpers                        */
  /* -------------------------------------------- */

  static chatListeners(html) {
    html.on('click', '.button', this._onChatCardAction.bind(this));
    html.on('click', '.item-name', this._onChatCardToggleContent.bind(this));
  }
  
  /* -------------------------------------------- */

  /**
   * Handle execution of a chat card action via a click event on one of the card buttons
   * @param {Event} event       The originating click event
   * @returns {Promise}         A promise which resolves once the handler workflow is complete
   * @private
   */
  static async _onChatCardAction(event) {
    event.preventDefault();
      
    // Extract card data
    const button = event.currentTarget;
    button.disabled = true;

    const card = button.closest(".chat-card");
    if(!card) return;
    const messageId = card.closest(".message").dataset.messageId;
    const message =  game.messages.get(messageId);
    const action = button.dataset.action;
    
    // Re-enable the button
    button.disabled = false;
  }
  
  /* -------------------------------------------- */

  /**
   * Get the Actor which is the author of a chat card
   * @param {HTMLElement} card    The chat card being used
   * @return {Actor|null}         The Actor entity or null
   * @private
   */
  static _getChatCardActor(card) {

    // Case 1 - a synthetic actor from a Token
    const tokenKey = card.dataset.tokenId;
    if (tokenKey) {
      const [sceneId, tokenId] = tokenKey.split(".");
      const scene = game.scenes.get(sceneId);
      if (!scene) return null;
      const tokenData = scene.getEmbeddedEntity("Token", tokenId);
      if (!tokenData) return null;
      const token = new Token(tokenData);
      return token.actor;
    }

    // Case 2 - use Actor ID directory
    const actorId = card.dataset.actorId;
    return game.actors.get(actorId) || null;
  }
  
  /**
   * Handle toggling the visibility of chat card content when the name is clicked
   * @param {Event} event   The originating click event
   * @private
   */
  static _onChatCardToggleContent(event) {
    event.preventDefault();
    const header = event.currentTarget;
    const card = header.closest(".chat-card");
    const content = card.querySelector(".card-description");
    content.style.display = content.style.display === "none" ? "block" : "none";
  }
}
