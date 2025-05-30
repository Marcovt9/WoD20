import {
  ItemMtA
} from "./item.js";
import * as customui from "./ui.js";
import * as templates from "./templates.js";

/**
 * Extend the basic ItemSheet with some very simple modifications
 */

export class MtAItemSheet extends ItemSheet {
  constructor(...args) {
    super(...args);
  }

  /**
   * Extend and override the default options used by the Simple Item Sheet
   * @returns {Object}
   */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["mta-sheet", "sheet", "item"],
      width: 630,
      tabs: [{
        navSelector: ".tabs",
        contentSelector: ".sheet-body",
        initial: "traits"
      }]
    });
  }

  /* -------------------------------------------- */
  /**
   * Return a dynamic reference to the HTML template path used to render this Item Sheet
   * @return {string}
   */

  get template() {
    const path = "systems/WoD20/templates/items";
    return `${path}/${this.item.type}.html`;
  }

  /* -------------------------------------------- */

  /**
   * Prepare data for rendering the Item sheet
   * The prepared data object contains both the actor data as well as additional sheet options
   */

  getData() {
    const sheetData = super.getData();
    const item = this.item;
    sheetData.config = CONFIG.MTA;

    const owner = this.actor;
  
    sheetData.all_traits = JSON.parse(JSON.stringify(CONFIG.MTA.all_traits));

    for(const key in sheetData.all_traits) {
      let t = sheetData.all_traits[key];
      t.list = t.list.reduce((prev, val) => {
        let ret = {};
        Object.entries(CONFIG.MTA[val]).forEach(e => {
          ret[ val + '.' + e[0] ] = e[1];
        });

        return {...prev, ...ret};
      }, {});
    }

    console.log("ASD", sheetData.config.all_traits);
    console.log("ASD", sheetData.all_traits);

    sheetData.custom_traits = [];

    if (owner?.system.characterType === "Vampire") {
      if(owner.system.disciplines_own) {
        sheetData.custom_traits = sheetData.custom_traits.concat(Object.entries(owner?.system.disciplines_own).map(ele => [ele[0], ele[1].label]));
        
        for(const key in owner.system.disciplines_own) {
          sheetData.all_traits.vampire_traits.list["disciplines_own." + key] = owner.system.disciplines_own[key].label;
        }
      }
    }

    console.log("ADSFS", sheetData.custom_traits)

    if (this.item.type === "discipline_power" || this.item.type === "devotion" || this.item.type === "rite" || owner?.system.characterType === "Vampire") {
      sheetData.disciplines = [];
      sheetData.disciplines = sheetData.disciplines.concat(Object.values(CONFIG.MTA.disciplines_common));
      sheetData.disciplines = sheetData.disciplines.concat(Object.values(CONFIG.MTA.disciplines_unique));
      if(owner?.system.disciplines_own) sheetData.disciplines = sheetData.disciplines.concat((Object.values(owner?.system.disciplines_own).map(d => d.label)));
    }


    if (["container","cover"].includes(this.item.type)) {
      item.system.contents ||= [];
      sheetData.inventory = this._getContainerInventory(item.system.contents);
    }

    if (this.item.type === "discipline_power" || this.item.type === "devotion" || this.item.type === "rite" || owner?.system.characterType === "Vampire") {
      sheetData.potentialAttributesName = "Vampire Traits";
      sheetData.potentialAttributes = [];
      sheetData.potentialAttributes.push({entries: Object.entries(CONFIG.MTA.disciplines_common), name: "disciplines_common"});
      sheetData.potentialAttributes.push({entries: Object.entries(CONFIG.MTA.disciplines_unique), name: "disciplines_unique"});
      if(owner?.system.disciplines_own) sheetData.potentialAttributes.push({entries: Object.entries(owner?.system.disciplines_own).map(ele => [ele[0], ele[1].label]), name: "disciplines_own"});
      sheetData.potentialAttributes.push({entries: Object.entries(CONFIG.MTA.vampire_traits), name: "vampire_traits"});

      sheetData.disciplines = [];
      sheetData.disciplines = sheetData.disciplines.concat(Object.values(CONFIG.MTA.disciplines_common));
      sheetData.disciplines = sheetData.disciplines.concat(Object.values(CONFIG.MTA.disciplines_unique));
      if(owner?.system.disciplines_own) sheetData.disciplines = sheetData.disciplines.concat((Object.values(owner?.system.disciplines_own).map(d => d.label)));
    }

    if(this.item.type === "merit") {
      sheetData.specialMerit = CONFIG.MTA.SPECIAL_MERITS.some(merit => merit.name === this.item.name);
    }
    sheetData.item = item;
    sheetData.system = item.system;
    console.log(sheetData)
    sheetData.enrichedDescription = TextEditor.enrichHTML(this.object.system.description, {async: false}); //FIXME: Put this into the sheets
    return sheetData;
  }

  /* -------------------------------------------- */

  /**
   * Activate event listeners using the prepared sheet HTML
   * @param html {HTML}   The prepared HTML object ready to be rendered into the DOM
   */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    if (this.item.type === "container" || this.item.type === "cover") this._registerContainerListeners(html);

    // Add effect
    html.find('.effectAdd').click(async event => {
      const systemData = this.item.system;
      const effectList = systemData.effects ? foundry.utils.duplicate(systemData.effects) : [];
      if(CONFIG.MTA.ephemeralItemTypes.includes(this.item.type) || this.actor?.type === "ephemeral") effectList.push({name: "eph_physical.power", value: 0}); 
      else effectList.push({name: "attributes_physical.strength", value: 0});
    
      await this.item.update({
        ["system.effects"]: effectList
      });
    });

    // Remove effect
    html.find('.effectRemove').click(async event => {
      const systemData = this.item.system;
      const effectList = systemData.effects ? foundry.utils.duplicate(systemData.effects) : [];
      const index = event.currentTarget.dataset.index;
      effectList.splice(index, 1);
    
      await this.item.update({
        ["system.effects"]: effectList
      });
    });

    // Add attribute to dicepool
    html.find('.dicePoolAdd').click(async event => {
      const systemData = this.item.system;

      if(systemData.dicepools_primary) {
        const index = event.currentTarget.dataset.index;
        let attributeList = systemData.dicepools_primary[index].attributes ? foundry.utils.duplicate(systemData.dicepools_primary[index].attributes) : [];
        attributeList.push("attributes_physical.strength");
      
        let dicepoolList = foundry.utils.duplicate(systemData.dicepools_primary);
        dicepoolList[index].attributes = attributeList;

        await this.item.update({
          ["data.dicepools_primary"]: dicepoolList
        });
      }
      else { // Default
        let attributeList = systemData.dicePool?.attributes ? foundry.utils.duplicate(systemData.dicePool.attributes) : [];
        attributeList.push("attributes_physical.strength");
      
        await this.item.update({
          ["data.dicePool.attributes"]: attributeList
        });
      }
    });

    // Remove attribute from dicepool
    html.find('.dicePoolRemove').click(async event => {
      const systemData = this.item.system;

      if(systemData.dicepools_primary) {
        const index = event.currentTarget.dataset.index;
        const dpindex = event.currentTarget.dataset.dpindex;
        let attributeList = systemData.dicepools_primary[index].attributes ? foundry.utils.duplicate(systemData.dicepools_primary[index].attributes) : [];
        attributeList.splice(dpindex, 1);
      
        let dicepoolList = foundry.utils.duplicate(systemData.dicepools_primary);
        dicepoolList[index].attributes = attributeList;

        await this.item.update({
          ["system.dicepools_primary"]: dicepoolList
        });
      }
      else { // Default
        let attributeList = systemData.dicePool?.attributes ? foundry.utils.duplicate(systemData.dicePool.attributes) : [];
        const index = event.currentTarget.dataset.index;
        attributeList.splice(index, 1);
      
        await this.item.update({
          ["system.dicePool.attributes"]: attributeList
        });
      }
    });

    html.find('.multipleDicePoolsRemove').click(async event => {
      const systemData = this.item.system;
      let dicePoolList = systemData.dicepools_primary ? foundry.utils.duplicate(systemData.dicepools_primary) : [];
      const index = event.currentTarget.dataset.index;
      dicePoolList.splice(index, 1);
    
      await this.item.update({
        ["data.dicepools_primary"]: dicePoolList
      });
    });

    //Custom select text boxes
    customui.registerCustomSelectBoxes(html, this);
  }

  /** @override */
  async _updateObject(event, formData) {
    if (!formData.system) formData = foundry.utils.expandObject(formData);

    if(formData.system?.dicepools_primary) {
      formData.system.dicepools_primary = Object.values(formData.system.dicepools_primary);
      
      for(let i = 0; i < formData.system.dicepools_primary.length; i++) {
        if(formData.system.dicepools_primary[i].attributes) {
          formData.system.dicepools_primary[i].attributes = Object.values(formData.system.dicepools_primary[i].attributes);
        }
      }
    }

    if(formData.system?.dicePool?.attributes) {
      formData.system.dicePool.attributes = Object.values(formData.system.dicePool.attributes);
    }
    if(formData.system?.effects) {
      formData.system.effects = Object.values(formData.system.effects);
    }
    // Update the Item
    await super._updateObject(event, formData);
  }

  /* -------------------------------------------- */
  /*                  CONTAINERS                  */
  /* -------------------------------------------- */


  _getContainerInventory(items) {
    let inventory;
    if(this.item.type === "cover") {
      inventory = {
        merit: {
          label: "Merits",
          items: [],
          dataset: ["MTA.Rating"]
        },
        condition: {
          label: "Conditions",
          items: [],
          dataset: ["MTA.Persistent"]
        }
      };
    }
    else { // TODO: This is never used
      inventory = {
        firearm: {
          label: "Firearm",
          items: [],
          dataset: ["Dmg.", "Range", "Cartridge", "Magazine", "Init."]
        },
        melee: {
          label: "Melee",
          items: [],
          dataset: ["Damage", "Type", "Initiative"]
        },
        armor: {
          label: "Armor",
          items: [],
          dataset: ["Rating", "Defense", "Speed", "Coverage"]
        },
        equipment: {
          label: "Equipment",
          items: [],
          dataset: ["Dice bonus", "Durability", "Structure"]
        },
        ammo: {
          label: "Ammo",
          items: [],
          dataset: ["Cartridge", "Quantity"]
        }
      };
    }

    items.forEach(item => {
      if (inventory[item.type]) {
        if (!inventory[item.type].items) {
          inventory[item.type].items = [];
        }
        inventory[item.type].items.push(item);
      }
    });
    return inventory;
  }


  _registerContainerListeners(html) {
    this.form.ondrop = ev => this._onDrop(ev);

    html.find('.item-row').each((i, li) => {
      if (li.classList.contains("header")) return;
      li.setAttribute("draggable", true);
      li.addEventListener("dragstart", this._onDragItemStart.bind(this), false);
    });

    html.find('.cell.item-name span').click(async event => await this._onItemSummary(event));


    // Delete Inventory Item
    html.find('.item-delete').click(event => {
      const data = this.getData();
      const index = Number(event.currentTarget.dataset.index);
      const type = event.currentTarget.dataset.type;
      let itemList = foundry.utils.duplicate(data.system.contents);
      let indexToDelete = this._getItemIndex(index,type,data);      
      
      if(indexToDelete > -1) {
        itemList.splice(indexToDelete, 1);
        this.item.update({
          ["system.contents"]: itemList
        });
      }
    });
  }

  _getItemIndex(index,type,data) {
    let foundIndex = -1;
    if(this.item.type === "cover") {
      let item = data.inventory[type].items[index];
      foundIndex = data.system.contents.indexOf(item);
    }
    else {
      foundIndex = index;
    } 
    return foundIndex;
  }

  async _onItemSummary(event) {
    event.preventDefault();
    const data = this.getData();
    let li = $(event.currentTarget).parents(".item-row");

    let index = this._getItemIndex(Number(li.data("index")),li.data("type"),data)
    let item = this.item.system.contents[index];

    let chatData = item.system ? foundry.utils.duplicate(item.system) : item.data;
    chatData.description = await TextEditor.enrichHTML(chatData.description, {
      secrets: this.owner,
      async: true,
    });

    let tb = $(event.currentTarget).parents(".item-table");

    let colSpanMax = [...tb.get(0).rows[0].cells].reduce((a, v) => (v.colSpan) ? a + v.colSpan * 1 : a + 1, 0);

    // Toggle summary
    if (li.hasClass("expanded")) {
      let summary = li.next(".item-summary");
      summary.children().children("div").slideUp(200, () => summary.remove());
    } else {
      let tr = $(`<tr class="item-summary"> <td colspan="${colSpanMax}"> <div> ${chatData.description} </div> </td> </tr>`);
 
      let div = tr.children().children("div");
      div.hide();
      li.after(tr);
      div.slideDown(200);
    }
    li.toggleClass("expanded");
  }

  async _onDragItemStart(event) {

    const data = this.getData();
    const index = this._getItemIndex(Number(event.currentTarget.dataset.index),event.currentTarget.dataset.type,data);
    let item = this.item.system.contents[index];
    item = foundry.utils.duplicate(item);
    if(item.data) { // 
      item.system = item.data;
      item.data = undefined;
    }
    console.log(item)
    event.dataTransfer.setData("text/plain", JSON.stringify({
      type: "Item",
      containerID: this.item.id,
      data: item
    }));
  }


  async _onDrop(event) {

    // Try to extract the data
    let data;
    try {
      data = JSON.parse(event.dataTransfer.getData('text/plain'));
    } catch (err) {
      return false;
    }
    console.log("ASD", data)
    if (data.containerID === this.item.id) {
      return false;
    }

    if (data.type === "Item") {
      const ownData = this.getData();
      const item = await Item.implementation.fromDropData(data);

      const newItem = await Item.implementation.create(item.toObject());
      let itemList = foundry.utils.duplicate(ownData.system.contents);
      if(!newItem.system) {
        newItem.system = newItem.data || {}
      }
      
      itemList.push(newItem);

      let i = await this.item.update({
        ["system.contents"]: itemList
      });

      return i;
    }

    return false;
  }

}