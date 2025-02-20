import {
  DiceRollerDialogue
} from "./dialogue-diceRoller.js";
import {
  ReloadDialogue
} from "./dialogue-reload.js";
import {
  createShortActionMessage
} from "./chat.js";
import {
  SkillEditDialogue
} from "./dialogue-skillEdit.js";

import "../lib/dragster/dragster.js";
import * as customui from "./ui.js";
import * as templates from "./templates.js";

const getInventory = () => ({
  firearm: {
    dataset: [ "MTA.DamageShort", "MTA.Range", "MTA.Cartridge", "MTA.Magazine"]
  },
  melee: {
    dataset: [ "MTA.Damage", "MTA.Type"]
  },
  armor: {
    dataset: [ "MTA.Rating", "MTA.Speed", "MTA.Coverage" ]
  },
  equipment: {
    dataset: [ "MTA.DiceBonus", "MTA.Durability", "MTA.Structure"]
  },
  ammo: {
    dataset: [ "MTA.Cartridge", "MTA.Quantity" ]
  },
  merit: {
    dataset: [ "MTA.Rating" ]
  },
  rite: {
    dataset: [ "MTA.Type", "MTA.RiteTarget", "MTA.Withstand" ]
  },
  discipline_power: {
    dataset: [ "MTA.Discipline", "MTA.Level", "MTA.Cost", "MTA.Action" ]
  },
  form: {
    descriptions: [],
    dataset: []
  },
  formAbility: {
    dataset: [ "MTA.Weapon", "MTA.Active" ]
  }
});

export class MtAActorSheet extends ActorSheet {
  constructor(...args) {
    super(...args);

    Hooks.on("closeProgressDialogue", (app, ele) => {
      if (app === this._progressDialogue) this._progressDialogue = null;
    });
  }

  /* -------------------------------------------- */

  /**
   * Get the correct HTML template path to use for rendering this particular sheet
   * @type {String}
   */
  get template() {
    if (!game.user.isGM && this.actor.limited) return "systems/WoD20/templates/actors/limited-sheet.html";
    if (this.actor.type === "ephemeral") return "systems/WoD20/templates/actors/ephemeral-sheet.html";
    return "systems/WoD20/templates/actors/character.html";
  }

  /* -------------------------------------------- */

  /**
   * Extend and override the default options used by the 5e Actor Sheet
   * @returns {Object}
   */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["mta-sheet", "worldbuilding", "sheet", "actor"],
      width: 1166,
      height: 830,
      dragDrop: [{dragSelector: "tbody .item-row", dropSelector: null}],
      tabs: [{
        navSelector: ".tabs",
        contentSelector: ".sheet-body",
        initial: "attributes"
      }]
    });
  }

  /* -------------------------------------------- */

  /**
   * Prepare data for rendering the Actor sheet
   * The prepared data object contains both the actor data as well as additional sheet options
   */
  getData() {
    // The Actor's data
    const actor = this.actor;
    const systemData = actor.system;
    const items = actor.items;
    const sheetData = {};

    /* const data = super.getData();
    Object.assign(data.data, data.data.data)
    data.data.data = null; */ // Previous fix

    const inventory = getInventory();

    //Localise inventory headers
    Object.values(inventory).forEach(section => {
      section.items = [];
      section.dataset.forEach((item, i, a ) => a[i] = game.i18n.localize(item));
    });

    items.forEach(item => {
      if (inventory[item.type]) {
        if (!inventory[item.type].items) {
          inventory[item.type].items = [];
        }
        inventory[item.type].items.push(item);
      }
    });
    
    //Inventory sorting
    const sortFlags = game.user.flags?.mta ? game.user.flags.mta[this.actor.id] : undefined;
    if(sortFlags){
      for(let itemType in inventory){
        const flag = sortFlags[itemType];
        if(flag && flag.sort === "up"){
          inventory[itemType].items.sort((a, b) => a.name.localeCompare(b.name))
        }
        else if(flag && flag.sort === "down"){
          inventory[itemType].items.sort((a, b) => b.name.localeCompare(a.name))
        }
        else {
          inventory[itemType].items.sort((a, b) => b.sort - a.sort);
        }
      }
    }
    else {
      for(let itemType in inventory){
        inventory[itemType].items.sort((a, b) => b.sort - a.sort);
      }
    }

    if (systemData.characterType === "Vampire") sheetData.vitae_per_turn = CONFIG.MTA.bloodPotency_levels[Math.min(10, Math.max(0, systemData.vampire_traits.bloodPotency.value))].vitae_per_turn;

    //Get additional attributes & skills from config file
    if (actor.type === "character") {
      Object.entries(CONFIG.MTA.attributes_physical).forEach(([key,value], index) => {
        if(!systemData.attributes_physical[key]) systemData.attributes_physical[key] = {value: 0};
      });
      Object.entries(CONFIG.MTA.attributes_social).forEach(([key,value], index) => {
        if(!systemData.attributes_social[key]) systemData.attributes_social[key] = {value: 0};
      });
      Object.entries(CONFIG.MTA.attributes_mental).forEach(([key,value], index) => {
        if(!systemData.attributes_mental[key]) systemData.attributes_mental[key] = {value: 0};
      });
      Object.entries(CONFIG.MTA.skills_physical).forEach(([key,value], index) => {
        if(!systemData.skills_physical[key]) systemData.skills_physical[key] = {value: 0};
      });
      Object.entries(CONFIG.MTA.skills_social).forEach(([key,value], index) => {
        if(!systemData.skills_social[key]) systemData.skills_social[key] = {value: 0};
      });
      Object.entries(CONFIG.MTA.skills_mental).forEach(([key,value], index) => {
        if(!systemData.skills_mental[key]) systemData.skills_mental[key] = {value: 0};
      });
      Object.entries(CONFIG.MTA.disciplines_common).forEach(([key,value], index) => {
        if(!systemData.disciplines_common[key]) systemData.disciplines_common[key] = {value: 0};
      });
      Object.entries(CONFIG.MTA.disciplines_unique).forEach(([key,value], index) => {
        if(!systemData.disciplines_unique[key]) systemData.disciplines_unique[key] = {value: 0};
      });
    }

    // if (systemData.characterType === "Scion"){
    //   Object.entries(CONFIG.MTA.scion_traits).forEach(([key,value], index) => {
    //     if(!systemData.scion_traits[key]) systemData.scion_traits[key] = {value: 0};
    //   });
    // }

    const data = {
      actor,
      inventory,
      system: systemData,
      owner: actor.isOwner,
      limited: actor.limited,
      options: this.options,
      editable: this.isEditable,
      cssClass: actor.isOwner ? "editable" : "locked",
      config: CONFIG.MTA,
      rollData: this.actor.getRollData.bind( this.actor ), // What is this?
      ...sheetData
    };
    console.log(data)
    return data;
  }

  /* -------------------------------------------- */

  /**
   * Activate event listeners using the prepared sheet HTML
   * @param html {HTML}   The prepared HTML object ready to be rendered into the DOM
   */
  activateListeners(html) {
    super.activateListeners(html);

    //Custom select text boxes
    customui.registerCustomSelectBoxes(html, this);
    
    //Health tracker
    /* this._onBoxChange(html); */
    this._initialiseDotTrackers(html);

    // 
    html.find('.cell.item-name span').click(event => this._onItemSummary(event));

    // Collapse item table
    html.find('.item-table .cell.header.first .collapsible.button').click(event => this._onTableCollapse(event));
    
    // Receive collapsed state from flags
    html.find('.item-table .cell.header.first .collapsible.button').toArray().filter(ele => {
      if(this.actor &&  this.actor.id && game.user.flags.mta && game.user.flags.mta[this.actor.id] && game.user.flags.mta[this.actor.id][$(ele).siblings('.sortable.button')[0].dataset.type] && game.user.flags.mta[this.actor.id][$(ele).siblings('.sortable.button')[0].dataset.type].collapsed){
        $(ele).parent().parent().parent().siblings('tbody').hide();
        $(ele).addClass("fa-plus-square");
      }
    });
    
    // Sort item table
    html.find('.item-table .cell.header.first .sortable.button').click(event => this._onTableSort(event));
    
    // Receive sort state from flags
    html.find('.item-table .cell.header.first .sortable.button').toArray().filter(ele => {
      if(this.actor &&  this.actor.id && game.user.flags.mta && game.user.flags.mta[this.actor._id] && game.user.flags.mta[this.actor.id][ele.dataset.type]){
        const sort = game.user.flags.mta[this.actor.id][ele.dataset.type].sort;
        const et = $(ele).children(".fas");
        if (sort === "up") { // sort A-Z
          et.removeClass("fa-sort");
          et.addClass("fa-sort-up");

        }
        else if (sort === "down") { // sort Z-A
          et.removeClass("fa-sort");
          et.removeClass("fa-sort-up");
          et.addClass("fa-sort-down");

        }
      }
    });

    /* Everything below here is only needed if the sheet is editable */
    if (!this.options.editable) return;

    // Update Inventory Item
    html.find('.item-edit').click(event => {
      const itemId = event.currentTarget.closest(".item-edit").dataset.itemId;
      const item = this.actor.items.get(itemId);
      item.sheet.render(true);
    });

    html.find('.item-delete').click(ev => {
      const itemId = event.currentTarget.closest(".item-delete").dataset.itemId;

      if(ev.shiftKey) { // Delete immediately
        this.actor.deleteEmbeddedDocuments("Item",[itemId]);
        return;
      }

      // Confirmation dialogue
      let d = new Dialog({
        title: "Confirm delete",
        content: "<p>Are you sure you want to permanently delete this item?</p><p>(Holding shift skips this dialogue)</p>",
        buttons: {
         one: {
          icon: '<i class="fas fa-trash"></i>',
          label: "Delete",
          callback: () => this.actor.deleteEmbeddedDocuments("Item",[itemId])
         },
         two: {
          label: "Cancel"
         }
        },
        default: "two"
       });
       d.render(true);
    });

    // Item Dragging
    
    let handler = ev => this._handleDragEnter(ev)
    html.find('.item-row').each((i, li) => {
      if (li.classList.contains("header")) return;
      //li.setAttribute("draggable", true);
      new Dragster( li );
      li.addEventListener("dragster:enter", ev => this._handleDragEnter(ev) , false);
      li.addEventListener("dragster:leave", ev => this._handleDragLeave(ev) , false);
    });
    
    // Equip Inventory Item
    html.find('.equipped.checkBox input').click(ev => {
      const itemId = ev.currentTarget.closest(".equipped.checkBox input").dataset.itemId;
      const item = this.actor.items.get(itemId);
      let toggle = !item.system.equipped;
      const updateData = {
        "system.equipped": toggle
      };
      item.update(updateData);
    });

    html.find('.coverActive.checkBox input').click(ev => {
      const itemId = ev.currentTarget.closest(".coverActive.checkBox input").dataset.itemId;
      const item = this.actor.items.get(itemId);
      const updateData = [];
      this.actor.items.forEach(actorItem => {
        if(actorItem._id !== item._id && actorItem.type == "cover" && actorItem.system.isActive) {
          updateData.push({
            _id: actorItem._id,
            "system.isActive": false
          });
        }
      });
      updateData.push({
        _id: item._id,
        "system.isActive": !item.system.isActive
      });
      this.actor.updateEmbeddedDocuments("Item", updateData);
    });

    html.find('.formAbilityActive.checkBox input').click(ev => {
      const itemId = ev.currentTarget.closest(".formAbilityActive.checkBox input").dataset.itemId;
      const item = this.actor.items.get(itemId);
      let toggle = !item.system.effectsActive;
      const updateData = {
        "system.effectsActive": toggle
      };
      item.update(updateData);
    });

    html.find('.favicon').click(ev => {
      const itemId = ev.currentTarget.closest(".favicon").dataset.itemId;
      const item = this.actor.items.get(itemId);
      let toggle = !item.system.isFavorite
      const updateData = {
        "system.isFavorite": toggle
      };
      item.update(updateData);
    });

    html.find('.activeIcon').click(ev => {
      const itemId = ev.currentTarget.closest(".activeIcon").dataset.itemId;
      const item = this.actor.items.get(itemId);
      let toggle = !item.system.effectsActive
      const updateData = {
        "system.effectsActive": toggle
      };
      item.update(updateData);
    });    

    html.find('.relinquish.unsafe').click(ev => {
      const itemId = ev.currentTarget.closest(".relinquish.unsafe").dataset.itemId;
      const item = this.actor.items.get(itemId);
      let isRelinquished = !item.system.isRelinquished;
      let isRelinquishedSafely = false;
      const updateData = {
        "system.isRelinquished": isRelinquished,
        "system.isRelinquishedSafely": isRelinquishedSafely
      };
      item.update(updateData);
    });

    html.find('.relinquish.safe').click(ev => {
      const itemId = ev.currentTarget.closest(".relinquish.safe").dataset.itemId;
      const item = this.actor.items.get(itemId);
      let isRelinquishedSafely = !item.system.isRelinquishedSafely;
      let isRelinquished = false;
      const updateData = {
        "system.isRelinquished": isRelinquished,
        "system.isRelinquishedSafely": isRelinquishedSafely
      };
      item.update(updateData);
    });

    html.find('.item-create').click(this._onItemCreate.bind(this));

    html.find('.discipline-create').click(ev => {
      let ownDisciplines = this.actor.system.disciplines_own ? duplicate(this.actor.system.disciplines_own) : {};
      let discipline = {
        label: "New Discipline",
        value: 0
      };
      let newKey = Object.keys(ownDisciplines).reduce((acc, ele) => {
        return +ele > acc ? +ele : acc;
      }, 0);
      newKey += 1;
      ownDisciplines[newKey] = discipline;
      const updateData = {
        "system.disciplines_own": ownDisciplines
      };
      this.actor.update(updateData);
    });

    html.find('.discipline-delete').click(ev => {
      let ownDisciplines = this.actor.system.disciplines_own ? duplicate(this.actor.system.disciplines_own) : {};
      const discipline_key = ev.currentTarget.closest(".discipline-delete").dataset.attribute;

      //delete ownDisciplines[discipline_key];
      ownDisciplines['-=' + discipline_key] = null;
      let updateData = {
        "system.disciplines_own": ownDisciplines
      };
      this.actor.update(updateData);
    });

    html.find('.discipline-edit').click(ev => {
      const et = $(ev.currentTarget);
      et.siblings(".discipline-name").toggle();
      et.siblings(".attribute-button").toggle();
    });

    $('.discipline-edit').on('keypress', function (e) {
      if(e.which === 13){
        const et = $(ev.currentTarget);
        et.siblings(".discipline-name").toggle();
        et.siblings(".attribute-button").toggle();
      }
    });

    // Reload Firearm
    html.find('.item-reload').click(ev => this._onItemReload(ev));

    html.find('.progress').click(async ev => {
      if (this._progressDialogue) this._progressDialogue.bringToTop();
      else this._progressDialogue = await new ProgressDialogue(this.actor).render(true);
    });

    html.find('.item-magValue').mousedown(ev => this._onItemChangeAmmoAmount(ev));

    html.find('.skill-specialty').click(ev => {
      ev.preventDefault();
      const trait = ev.currentTarget.dataset.trait;
      new SkillEditDialogue(this.actor, trait).render(true);
    });

    html.find('.niceNumber').click(function(event) {
      let v = $(event.target).text();
      let i = $(this).find('input');
      
      if (v === '+') {
        i.val(parseInt(i.val()) + 1);
      } else if (v === '−') {
        i.val(parseInt(i.val()) - 1);
      }
      
      i.trigger('change');
    });

    // Item Rolling
    html.find('.item-table .item-image').click(event => this._onItemRoll(event));

    // Calculate Max Health
    html.find('.calculate.health').click(event => {
      this.actor.calculateAndSetMaxHealth();
    });

    html.find('.calculate.resource').click(event => {
      this.actor.calculateAndSetMaxResource();
    });

    // Macros

    html.find('.perceptionButton').mousedown(ev => {
      switch (ev.which) {
        case 1:
          this.actor.rollPerception(false, true);
          break;
        case 2:
          break;
        case 3:
          //Quick Roll
          this.actor.rollPerception(true, true);
          break;
      }

    });
    

    // Clicking roll button
    html.find('.rollButton').mousedown(ev => {

      const attributeChecks = $(".attribute-check:checked");

      const attributeInputs = [];
      attributeChecks.each(function() {
        let $this = $(this);
        
        if ($this.attr("data-trait")) {
          attributeInputs.push($this);
        } else if ($this.parent().attr("data-trait")) {
          attributeInputs.push($this.parent());
        }
      });

      const rollAttributes = attributeInputs.map(v => v.attr("data-trait"));

      switch (ev.which) {
        case 1:
          this.actor.roll({traits: rollAttributes})
          break;
        case 2:
          break;
        case 3:
          //Quick Roll
          this.actor.roll({traits: rollAttributes, rollType: 'quick'})
          break;
      }

      //Uncheck attributes/skills and reset
      attributeChecks.prop("checked", !attributeChecks.prop("checked"));
    });

  }
  
  /* Handles drag-and-drop visual */
  _handleDragEnter(event){
    let ele = event.target.closest(".item-row");
    if(ele) $(ele).addClass('over')
  }
  
  _handleDragLeave(event) {
    let ele = event.target.closest(".item-row");
    if(ele) $(ele).removeClass('over')
  }

  
  _onDragStart(event) {
    const id = event.target.dataset.itemId;
    const source = this.actor.items.get(id);
    const background = source.img;
    let img = $(event.target).find('.item-image');
    img.css("cssText",'background-image: url(' + background + ') !important');

    event.dataTransfer.setDragImage(img[0], 0, 0);
    return super._onDragStart(event);
  }
  /** @override 
  * Exact copy of the foundry code, except for the !target render,
  * and the sortBefore check.
  */
  _onSortItem(event, itemData) {
    // TODO - for now, don't allow sorting for Token Actor overrides
    //if (this.actor.isToken) return;
      
    // Get the drag source and its siblings
    const source = this.actor.items.get(itemData._id);
    if(!source) return;
    const siblings = this.actor.items.filter(i => {
      return (i.type === source.type) && (i._id !== source._id);
    });

    if(siblings.length <= 0) return;

    // Get the drop target
    const dropTarget = event.target.closest(".item");
    const targetId = dropTarget ? dropTarget.dataset.itemId : null;

    //Find target that matches the source type and is not the source itself
    const target = this.actor.items.find(i => {
      return (i.type === source.type) 
              && (i._id !== source._id) 
              && (i._id === targetId);
    });

    if(!target) return this.render();
      
    const sortBefore = source.sort > target?.sort;

    // Perform the sort
    const sortUpdates = SortingHelpers.performIntegerSort(source, {target: target, siblings: siblings, sortBefore: sortBefore});
    const updateData = sortUpdates.map(u => {
      const update = u.update;
      update._id = u.target._id;
      return update;
    });
    // Perform the update
    return this.actor.updateEmbeddedDocuments("Item", updateData);

  }


/** @override */
async _onDropItemCreate(itemData) {
  let items = itemData instanceof Array ? itemData : [itemData];

  const toCreate = [];
  for ( const item of items ) {
    const result = await this._onDropSingleItem(item);
    if ( result ) toCreate.push(result);
  }

  // Create the owned items as normal
  return this.actor.createEmbeddedDocuments("Item", toCreate);
}

/**
   * Handles dropping of a single item onto this character sheet.
   * @param {object} itemData            The item data to create.
   * @returns {Promise<object|boolean>}  The item data to create after processing, or false if the item should not be
   *                                     created or creation has been otherwise handled.
   * @protected
   */
 async _onDropSingleItem(itemData) {

  // Check to make sure items of this type are allowed on this actor
  if(this.actor.type !== "ephemeral" && CONFIG.MTA.ephemeralItemTypes.includes(itemData.type)) {
    ui.notifications.warn("The item type can not be equipped by this character.");
    return false;
  }
  if(this.actor.type !== "character" && CONFIG.MTA.characterItemTypes.includes(itemData.type)) {
    ui.notifications.warn("The item type can not be equipped by this character.");
    return false;
  }

  // Clean up data
  if ( itemData.system ) {
    if(itemData.system.equipped) itemData.system.equipped = false;
    if(itemData.system.isFavorite) itemData.system.isFavorite = false;
  }

  return itemData;
}

  async _onItemChangeAmmoAmount(ev) {
    const weaponId = ev.currentTarget.closest(".item-magValue").dataset.itemId;
    const weapon = this.actor.items.get(weaponId);
    const magazine = weapon.system.magazine;

    if (magazine) {
      let ammoCount = magazine.system.quantity;
      switch (ev.which) {
        case 1:
          ammoCount = Math.min(ammoCount + 1, weapon.system.capacity);
          break;
        case 2:
          break;
        case 3:
          ammoCount = Math.max(ammoCount - 1, 0);
          break;
      }

      weapon.update({
        'system.magazine.system.quantity': ammoCount
      });
    }
  }

  /**
   * Handle reloading of a firearm from the Actor Sheet
   * @private
   */
  async _onItemReload(ev) {

    const weaponId = ev.currentTarget.closest(".item-reload").dataset.itemId;
    const weapon = this.actor.items.get(weaponId);
    const weaponData = weapon.system;
    if (weaponData.magazine) { // Eject magazine
      createShortActionMessage("Ejects magazine", this.actor);
      
      ev.target.classList.remove("reloaded");

      //Add ejected ammo back into the inventory
      const ammoData = {...weaponData.magazine};
      delete ammoData._id;
      delete ammoData.effects; // TODO: Remove once foundry bug is fixed (can't find the issue??)
      
      let foundElement = this.actor.items.find(item => (item.name === ammoData.name) && (item.system.cartridge === ammoData.system.cartridge));

      let updateData = [];
      let a;
      //const index = inventory.findIndex(ele => (ele.data.name === ammoData.name) && (ele.data.cartridge === ammoData.cartridge));
      if (foundElement) { // Add ammo to existing magazine
        updateData.push({
          _id: foundElement._id,
          'system.quantity': foundElement.system.quantity + ammoData.system.quantity
        }); 
      } 
      else a = await this.actor.createEmbeddedDocuments("Item", [ammoData]); // Add new magazine item

      updateData.push({
        _id: weapon.id,
        'system.magazine': null
      }); // Remove magazine from weapon
      this.actor.updateEmbeddedDocuments("Item", updateData);

    } else {
      //Open reload menu
      let ammoList = new ReloadDialogue(weapon, ev.target);
      ammoList.render(true);
    }
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  async _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    const type = header.dataset.type;
    const itemData = {
      name: `New ${type.capitalize()}`,
      type: type,
      data: duplicate(header.dataset)
    };
    
    delete itemData.data["type"];
    return this.actor.createEmbeddedDocuments("Item", [itemData]);
  }

  /**
   * Handle rolling of an item from the Actor sheet, obtaining the Item instance and dispatching to it's roll method
   * @private
   */
  _onItemRoll(event) {
    event.preventDefault();
    const itemId = event.currentTarget.closest(".item-name").dataset.itemId;
    const item = this.actor.items.get(itemId);
    
    return item.roll();
  }


  /**
   * Handle collapsing of inventory tables (e.g. firearms, etc.).
   * The collapsed state is stored per user for every actor for every table.
   * @private
   */
  _onTableCollapse(event) {
    const et = $(event.currentTarget);
    if (et.hasClass('fa-plus-square')) { // collapsed
      et.removeClass("fa-plus-square");
      et.addClass("fa-minus-square");
      et.parent().parent().parent().siblings('tbody').show();
      
      // Update user flags, so that collapsed state is saved
      let updateData = {'flags':{'mta':{[this.actor._id]:{[et.siblings('.sortable.button')[0].dataset.type]:{collapsed: false}}}}};
      game.user.update(updateData);
      
    } else { // not collapsed
      et.parent().parent().parent().siblings('tbody').hide();
      et.removeClass("fa-minus-square");
      et.addClass("fa-plus-square");
      
      // Update user flags, so that collapsed state is saved
      let updateData = {'flags':{'mta':{[this.actor._id]:{[et.siblings('.sortable.button')[0].dataset.type]:{collapsed: true}}}}};
      game.user.update(updateData);
    }
  }

    
    async _onTableSort(event) {
      const et = $(event.currentTarget).children(".fas");
      if (et.hasClass('fa-sort')) { // sort A-Z
        et.removeClass("fa-sort");
        et.addClass("fa-sort-up");
        
        // Update user flags, so that sorted state is saved
        let updateData = {'flags':{'mta':{[this.actor.id]:{[event.currentTarget.dataset.type]:{sort: 'up'}}}}};
        await game.user.update(updateData);
      }
      else if (et.hasClass('fa-sort-up')) { // sort Z-A
        et.removeClass("fa-sort-up");
        et.addClass("fa-sort-down");
        
        // Update user flags, so that sorted state is saved
        let updateData = {'flags':{'mta':{[this.actor.id]:{[event.currentTarget.dataset.type]:{sort: 'down'}}}}};
        await game.user.update(updateData);
      }
      else {
        et.removeClass("fa-sort-down"); // unsorted
        et.addClass("fa-sort");
        
        // Update user flags, so that sorted state is saved
        let updateData = {'flags':{'mta':{[this.actor.id]:{[event.currentTarget.dataset.type]:{sort: 'none'}}}}};
        await game.user.update(updateData);
      }
      this.render()
    }


  async _onItemSummary(event) {
    event.preventDefault();
    const li = $(event.currentTarget).parents(".item-row");

    // Toggle summary
    if (li.hasClass("expanded")) {
      const summary = li.next(".item-summary");
      summary.children().children("div").slideUp(200, () => summary.remove());
    } else {
      const tb = $( event.currentTarget ).parents( ".item-table" );
      const colSpanMax = [ ...tb.get( 0 ).rows[ 0 ].cells ].reduce( ( a, v ) => ( v.colSpan ) ? a + v.colSpan * 1 : a + 1, 0 );
      const item = this.actor.items.get( li.data( "item-id" ) );
      const chatData = await item.getChatData({
        secrets: this.actor.owner
      });
      const tr = $(`<tr class="item-summary"> <td colspan="${colSpanMax}"> <div> ${chatData.description} </div> </td> </tr>`);
      const div = tr.children().children("div");
      div.hide();
      li.after(tr);
      div.slideDown(200);
    }
    li.toggleClass("expanded");
  }

  async _initialiseDotTrackers(html){
    let trackers = html.find('.kMageTracker');
    trackers.toArray().forEach( trackerEle => {
      if( trackerEle.dataset && !trackerEle.dataset.initialised){
        let makeHiddenInput = (name,value,dataType="Number") => {
          let i = document.createElement('input');
          i.type = 'hidden';
          i.name = name;
          i.value = value;
          if(dataType){i.dataset.dtype=dataType;}
          return trackerEle.insertAdjacentElement('afterbegin',i);
        }
        let td = trackerEle.dataset;
        let trackerName = td.name || 'unknowntracker';
        let trackerNameDelimiter = '.';
        let trackerType = (td.type)?td.type:'oneState';
        let stateOrder = (td.states)?td.states.split('/'):['off','on'];
        let stateCount = stateOrder.map( v => (td[v])?td[v]*1:0 ).map( (v,k,a) => ((k>0)?a[0]-v:v) ).map( v => (v < 0)?0:v );
        let stateHighest = stateOrder.length -1; 
        let markingOn = (td.marked !== undefined)?true:false;
        let markedBoxes = null, mbInput = null;
        if(markingOn){
          markedBoxes = [...Array(stateCount[0])].map(v => 0);
          td.marked.split(',').forEach( (v,k) => { if(k < markedBoxes.length && (v*1)){ markedBoxes[k] = 1 } } ) 
          mbInput = makeHiddenInput(trackerName + trackerNameDelimiter + 'marked',markedBoxes.join(','),false);
          trackerEle.insertAdjacentElement('afterbegin',mbInput)
        }
        let renderBox = trackerEle.appendChild( document.createElement('div') );
        trackerEle.dataset.initialised = 'yes';
        let inputs = stateOrder.map( (v,k) => {
          if(k === 0 && this.options.editable){
            trackerEle.insertAdjacentHTML('afterbegin',`<div class="niceNumber">
             <input name="${trackerName + trackerNameDelimiter + v}" type="number" value="${stateCount[k]}">
             <div class="numBtns"><div class="plusBtn">+</div><div class="minusBtn">−</div></div>
            </div>`);
            return trackerEle.firstChild;
          } else {
            return makeHiddenInput(trackerName + trackerNameDelimiter + v, stateCount[0] - stateCount[k]);
          }
        });
        
        let updateDots = (num=0, index=false) => {
          let abNum = Math.abs(num);
          
          // update the stateCount
          // if(index) then fill all dots up to & incl. index with num or empty all dots down to & incl. index if they are <=
          if(num > 0 || num < 0){
            if(index !== false){ 
              stateCount.forEach( (c,s,a) => { if(s<=abNum && s > 0){ a[s] = (num > 0)?index + 1:index; } } );
            } else {
              stateCount = stateCount.map( (c,s,a) => (num > 0 && s == abNum)?c+1:( num < 0 && s<= abNum && s > 0)?c-1:c );
            }
          }
          
           // clamping down values in case they somehow got bugged minimum 0, maximum is the count of state 0
          stateCount = stateCount.map( v => (v <0)?0:(v>stateCount[0])?stateCount[0]:v);
          
          // removing marks if the corresponding box is set to status 0
          if(markingOn){
            markedBoxes = markedBoxes.map( (v,k) => (v && k < stateCount[1])?v:0 ); }
          
          // update inputs
          stateCount.forEach( (c,s) => {
            let nuVal = stateCount[0] - c;
            if(inputs[s].value !== undefined && inputs[s].value != nuVal){   inputs[s].value = nuVal; }
          });
          if(markingOn){
            mbInput.value = markedBoxes.join(',');}
          
          
          // render
          let dots = [...Array(stateCount[0])].map( (v,k) => stateCount.slice(1).reduce( (a,scC,scK) => (scC >=(k+1))?scK+1:a ,0) );
          let r = '<div class="boxes">' + dots.reduce( (a,v,k) => a + `<div data-state="${v}" data-index="${k}"${markingOn&&markedBoxes[k]?' data-marked="true" title="Resistant"':''}></div>`,'') + '</div>';
          if( trackerType == 'health' && !(this.actor.type === "ephemeral")){ 
            //let dicePenalty = dots.slice(-stateHighest).reduce( (a,v) => (v>0)?a+1:a ,0);
            let dicePenalty = this.actor.getWoundPenalties();
            r += `<div class="info"><span>${game.i18n.localize('MTA.DicePenalty')}<b>: ${dicePenalty}</b></span></div>`;
            r += `<div class="info"><span>${game.i18n.localize('MTA.MovementPenalty')}<b>: ${dicePenalty * 2} mts.</b></span></div>`;
          }

          renderBox.innerHTML = r;
          
          if(num !== 0){   inputs[1].dispatchEvent( new Event('change',{'bubbles':true}) )   }
        };
        
        if (this.options.editable) {
          // attaching event listeners for left and right clicking the states and changing the max value input
          trackerEle.addEventListener('pointerdown', (e, t = e.target) => {
            if( t.dataset && t.dataset.state ){
              let s = t.dataset.state*1;
              let index = (trackerType == 'oneState' && t.dataset.index)?t.dataset.index*1:false;

              if(e.button === 1 && markingOn && t.dataset.index && t.dataset.index < markedBoxes.length ){
                e.preventDefault();
                markedBoxes[t.dataset.index] = (markedBoxes[t.dataset.index])?0:1;
                updateDots('update');
              }
              else{
                updateDots( (e.button === 2)?-s:(s===stateHighest)?-s:s+1,index);
              }
            }
          });
          trackerEle.addEventListener('contextmenu', (e, t = e.target) => { if(t.dataset.state){  e.preventDefault();  } });
          trackerEle.addEventListener('input', (e, t = e.target) => {
            if(t.type == 'number' && t.name == (trackerName + trackerNameDelimiter +stateOrder[0])){
              stateCount[0] = t.value * 1;
              updateDots('update');
            }
          });
        }
        
        // trigger first render
        updateDots();
      }
    });
  }

  /** @override */
  async _updateObject(event, formData) {
    if (!formData.data) formData = expandObject(formData);
    // Update the Item
    await super._updateObject(event, formData);
  }
}