// Import Modules
import { MtAActorSheet } from "./actor-sheet.js";
import { MtAItemSheet } from "./item-sheet.js";
import { ItemMtA } from "./item.js";
import { ActorMtA } from "./actor.js";
import { DiceRollerDialogue } from "./dialogue-diceRoller.js";
import { registerSystemSettings } from "./settings.js";
import * as templates from "./templates.js";
import { MTA } from "./config.js";
import { TokenHotBar } from "./token-macrobar.js";
import { TokenMTA } from "./token.js";

/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */

Hooks.once("init", async function () {
  console.log(`Initializing MtA System`);
  CONFIG.debug.hooks = false;

  CONFIG.MTA = MTA;
  CONFIG.TinyMCE.toolbar = CONFIG.TinyMCE.toolbar.replace("styles", "styles fontfamily forecolor backcolor");
  CONFIG.Combat.initiative.formula = "1d10 + @derivedTraits.initiativeMod.final";

  CONFIG.Item.documentClass = ItemMtA;
  CONFIG.Actor.documentClass = ActorMtA;
  CONFIG.Token.objectClass = TokenMTA;

  // V13+: Cambiar duración de activación de tooltips
  if (ui.tooltip) {
    ui.tooltip.constructor.TOOLTIP_ACTIVATION_MS = 0;
  }

  CONFIG.JournalEntry.noteIcons = {
    Airport: "systems/WoD20/icons/notes/airport.svg",
    Anchor: "icons/svg/anchor.svg",
    Bag: "systems/WoD20/icons/notes/bag.svg",
    Barracks: "systems/WoD20/icons/notes/barracks.svg",
    Book: "icons/svg/book.svg",
    Bridge: "icons/svg/bridge.svg",
    Cave: "icons/svg/cave.svg",
    Chest: "icons/svg/chest.svg",
    City: "systems/WoD20/icons/notes/city.svg",
    Computer: "systems/WoD20/icons/notes/computer.svg",
    House: "icons/svg/house.svg",
    Island: "icons/svg/island.svg",
    Key: "icons/svg/key.svg",
    Mountain: "icons/svg/mountain.svg",
    "Oak Tree": "icons/svg/oak.svg",
    Obelisk: "icons/svg/obelisk.svg",
    Pentagram: "systems/WoD20/icons/notes/pentagram.svg",
    Pin: "systems/WoD20/icons/notes/pin.svg",
    Portal: "systems/WoD20/icons/notes/portal.svg",
    Ruins: "icons/svg/ruins.svg",
    Shop: "systems/WoD20/icons/notes/shop.svg",
    Sign: "systems/WoD20/icons/notes/sign.svg",
    Skull: "icons/svg/skull.svg",
    Spell: "systems/WoD20/icons/notes/spell.svg",
    Spirit: "systems/WoD20/icons/notes/spirit.svg",
    Tankard: "icons/svg/tankard.svg",
    "Temple Gate": "systems/WoD20/icons/notes/temple-gate.svg",
    Totem: "systems/WoD20/icons/notes/totem.svg",
    Tower: "systems/WoD20/icons/notes/tower.svg",
    Trap: "icons/svg/trap.svg",
    Village: "icons/svg/village.svg"
  };

  // Registrar settings aquí (game ya existe)
  registerSystemSettings();

  // Registrar sheets
  foundry.documents.collections.Actors.unregisterSheet("core", foundry.appv1.sheets.ActorSheet);
  foundry.documents.collections.Actors.registerSheet("cod2e", MtAActorSheet, { makeDefault: true });
  foundry.documents.collections.Items.unregisterSheet("core", foundry.appv1.sheets.ItemSheet);
  foundry.documents.collections.Items.registerSheet("cod2e", MtAItemSheet, { makeDefault: true });

  // Preload Handlebars Templates
  templates.preloadHandlebarsTemplates();
  templates.registerHandlebarsHelpers();
});

/**
 * Localización de CONFIG
 */
Hooks.once("setup", function () {
  const toLocalize = [
    "attributes_physical",
    "attributes_social",
    "attributes_mental",
    "skills_physical",
    "skills_social",
    "skills_mental",
    "derivedTraits",
    "disciplines_common",
    "disciplines_unique",
    "vampire_traits",
    "scion_traits"
  ];

  const noSort = [
    "attributes_physical",
    "attributes_social",
    "attributes_mental",
    "derivedTraits"
  ];

  for (let o of toLocalize) {
    const localized = Object.entries(CONFIG.MTA[o]).map(e => {
      return [e[0], game.i18n.localize(e[1])];
    });
    if (!noSort.includes(o)) localized.sort((a, b) => a[1].localeCompare(b[1]));
    CONFIG.MTA[o] = localized.reduce((obj, e) => {
      obj[e[0]] = e[1];
      return obj;
    }, {});
  }
});

/**
 * Once ready
 */
Hooks.once("ready", function () {
  CONFIG.MTA.TOKENBAR = TokenHotBar.tokenHotbarInit();
  foundry.utils.debounce(createTokenBar, 200);

  // 👇 Ahora este hook se engancha en ready, con settings ya registradas
  Hooks.on("renderChatMessage", (message, html, data) => {
    if (game.settings.get("mta", "autoCollapseItemDescription")) {
      html.find(".card-description").hide();
    }

    if (data.message.blind && !game.user.isGM) {
      html.find(".dice-formula").html(`???`);
      html.find(".dice-tooltip").html(``);
      let total = html.find(".dice-total");
      total.html(`?`);
      total.removeClass("exceptionalSuccess dramaticFailure");
    }

    const actor = game.actors.get(data.message.speaker.actor);
    const senderName = html.find(".message-sender");

    if (actor && !actor.getUserLevel(game.user)) {
      if (
        actor.prototypeToken.displayName === CONST.TOKEN_DISPLAY_MODES.ALWAYS ||
        actor.prototypeToken.displayName === CONST.TOKEN_DISPLAY_MODES.HOVER
      ) {
        senderName.text(actor.prototypeToken.name);
      } else senderName.text("???");
    }

    if (actor && actor.isOwner) return;
    else if (game.user.isGM || data.author.id === game.user.id) return;

    const chatCard = html.find(".chat-card");
    if (chatCard.length === 0) return;

    const buttons = chatCard.find("button[data-action]");
    buttons.each((i, btn) => {
      btn.style.display = "none";
    });
  });
});

Hooks.on("renderChatLog", (app, html, data) => ItemMtA.chatListeners(html));

$(document).ready(() => {
  const diceIconSelector = "#chat-controls .chat-control-icon .fa-dice-d20";
  $(document).on("click", diceIconSelector, ev => {
    ev.preventDefault();
    let diceRoller = new DiceRollerDialogue({});
    diceRoller.render(true);
  });
});

Hooks.on("renderActorDirectory", (app, html, data) => {
  const $html = $(html);  // envolver en jQuery
  const actorListItems = $html.find('.actor');

  actorListItems.toArray().forEach(v => {
    const id = v.dataset.documentId;
    if (id) {
      const actor = game.actors.get(id);
      if (actor) {
        const characterType = actor.type === "character"
          ? actor.system.characterType
          : actor.system.ephemeralType;
        const color = game.user.isGM || actor.system.isTypeKnown
          ? CONFIG.MTA.typeColors[characterType]
          : CONFIG.MTA.typeColors["unknown"];
        $(v).find('img').css("border", "1px solid " + color);
      } else {
        console.log("ERROR: invalid actor found.");
      }
    }
  });
});


const createTokenBar = () => {
  const controlled = canvas.tokens.controlled;
  if (controlled.length) {
    CONFIG.MTA.TOKENBAR.tokens = controlled;
    CONFIG.MTA.TOKENBAR.render(true);
  } else {
    CONFIG.MTA.TOKENBAR.close();
  }
};

Hooks.on("controlToken", foundry.utils.debounce(createTokenBar, 200));
Hooks.on("updateActor", foundry.utils.debounce(createTokenBar, 200));
Hooks.on("updateItem", foundry.utils.debounce(createTokenBar, 200));
Hooks.on("updateToken", foundry.utils.debounce(createTokenBar, 200));
