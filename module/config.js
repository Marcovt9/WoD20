/**
 * WARNING: Remember, if you change anything in this file, it will get overwritten when the system updates. 
 * So make a backup of any changes, and re-apply them afterwards.
 */

// Namespace Configuration Values
export const MTA = {};

const path = 'systems/WoD20/icons/placeholders/';


/**
 * The paths to the individual placeholder icons
 * for each item type within the system.
 * Feel free to modify, but add the corresponding
 * icon in the placeholder path.
 * Note: There is a bug in Firefox with svg icons which
 * have an explicity width and height.
*/
MTA.placeholders = new Map([
  ["condition", path + 'Condition.svg'],
  ["tilt", path + 'Tilt.svg'],
  ["environmental", path + 'EnvironmentalTilt.svg'],
  ["death", path + "Death.svg"],
  ["fate", path + "Fate.svg"],
  ["forces", path + "Forces.svg"],
  ["life", path + "Life.svg"],
  ["matter", path + "Matter.svg"],
  ["mind", path + "Mind.svg"],
  ["prime", path + "Prime.svg"],
  ["space", path + "Space.svg"],
  ["spirit", path + "Spirit.svg"],
  ["time", path + "Time.svg"],
  ["relationship", path + 'Relationship.svg'],
  ["vinculum", path + 'Relationship.svg'],
  ["service", path + 'Service.svg'],
  ["container", path + 'Container.svg'],
  ["merit", path + 'Merit.svg'],
  ["yantra", path + 'Yantra.svg'],
  ["firearm", path + 'Firearm.svg'],
  ["melee", path + 'Melee.svg'],
  ["unarmed", path + 'Unarmed.svg'],
  ["thrown", path + 'Thrown.svg'],
  ["equipment", path + 'Equipment.svg'],
  ["armor", path + 'Armor.svg'],
  ["ammo", path + 'Ammo.svg'],
  ["contract", path + 'Contract.svg'],
  ["pledge", path + 'Pledge.svg'],
  ["devotion", path + 'devotion.svg'],
  ["rite", path + 'Rite.svg'],
  ["miracle", path + 'Miracle.svg'],
  ["discipline_power", path + 'DisciplinePower.svg'],
  ["magic", path + 'Magic.svg'],
  ["werewolf_rite", path + 'Rite-Wolf.svg'],
  ["pack_rite", path + 'Rite-Pack.svg'],
  ["numen", path + 'Numen.svg'],
  ["manifestation", path + 'Manifestation.svg'],
  ["influence", path + 'Influence.svg'],
  ["moonGift", path + 'Gift-Moon.svg'],
  ["shadowGift", path + 'Gift-Shadow.svg'],
  ["wolfGift", path + 'Gift-Wolf.svg'],
  ["vehicle", path + 'Vehicle.svg'],
  ["dreadPower", path + 'DreadPower.svg'],
  ["embed", path + 'Embed.svg'],
  ["interlock", path + 'Interlock.svg'],
  ["exploit", path + 'Exploit.svg'],
  ["cover", path + 'Cover.svg'],
  ["glitch", path + 'Glitch.svg'],
  ["pact", path + 'Pact.svg'],
  ["formAbility", path + 'Manifestation.svg'],
  ["coil", path + 'Coil.svg'],
  ["scale", path + 'Scale.svg'],
  ["form", 'systems/WoD20/icons/forms/Gauru.svg'],
  ["tactic", path + 'Tactic.svg'],
  ["advanced_armory", path + 'advanced_armory.svg'],
  ["virtuous_ritual", path + 'virtuous_ritual.svg'],
  ["castigation_rite", path + 'castigation_rite.svg'],
  ["elixir", path + 'elixir.svg'],
  ["perispiritism_ritual", path + 'perispiritism_ritual.svg'],
  ["teleinformatics", path + 'teleinformatics.svg'],
  ["thaumatech_implant", path + 'thaumatech_implant.svg'],
]);

/**
 * The trait maximum for attribute & skill buffs.
 * if the trait has a higher base value on the sheet,
 * that value is used instead.
 * Change it freely.
*/
MTA.traitMaximum = 100; // The absolute trait buff maximum (though it could be infinite in theory...)
MTA.traitMaximumLower = 5; // The maximum used for buffs without the checkbox, only used for attributes&skills, not derived traits

/**
 * The list of supported character types.
 * Any value added to this list will fall back to the Mortal sheet.
 * @type {Array[]}
 */
MTA.characterTypes = ["Mortal", "Vampire"];

/**
 * The list of supported ephemeral entity types.
 * Any value added to this list will fall back to the ??? sheet.
 * @type {Array[]}
 */

MTA.all_traits = {
  attributes: {
    name: "MTA.Attributes",
    list: [
      "attributes_physical",
      "attributes_social",
      "attributes_mental"
    ]
  },
  skills: {
    name: "MTA.Skills",
    list: [
      "skills_physical",
      "skills_social",
      "skills_mental"
    ]
  },
  traits: {
    name: "MTA.Traits",
    list: [
      "derivedTraits"
    ]
  },
  vampire_traits: {
    name: "MTA.Vampire_traits",
    list: [
      "vampire_traits",
      "disciplines_common",
      "disciplines_unique",
    ]
  }
}


/**
 * The set of ephemeral attributes used within the system.
 * I know these attributes are technically not physical, social, and mental,
 * but do you seriously expect me to call these lists eph_power, etc.?
 * While new attributes can freely be added, removal is not advised (as some are used for derived traits).
 * @type {Object}
 */
MTA.eph_physical = {
  "power": "MTA.EphPower"
};
MTA.eph_social = {
  "finesse": "MTA.EphFinesse"
};
MTA.eph_mental = {
  "resistance": "MTA.EphResistance"
};


/**
 * The set of Attributes used within the system.
 * While new attributes can freely be added, removal is not advised (as some are used for derived traits).
 * @type {Object}
 */
MTA.attributes_physical = {
    "strength": "MTA.Strength",
    "dexterity": "MTA.Dexterity",
    "stamina": "MTA.Stamina"
  };
MTA.attributes_social = {
    "presence": "MTA.Presence",
    "manipulation": "MTA.Manipulation",
    "composure": "MTA.Composure"
  };
MTA.attributes_mental = {
    "intelligence": "MTA.Intelligence",
    "wits": "MTA.Wits",
    "resolve": "MTA.Resolve"
  };

/**
 * The set of Skills used within the system.
 * While new skills can freely be added, removal is not advised (as some are used for derived traits).
 * @type {Object}
 */
MTA.skills_physical = {
    "athletics": "MTA.Athletics",
    "brawl": "MTA.Brawl",
    "drive": "MTA.Drive",
    "firearms": "MTA.Firearms",
    "larceny": "MTA.Larceny",
    "stealth": "MTA.Stealth", 
    "survival": "MTA.Survival",
    "weaponry": "MTA.Weaponry"
  };
MTA.skills_social = {
    "animalKen": "MTA.AnimalKen",
    "empathy": "MTA.Empathy",
    "expression": "MTA.Expression",
    "intimidation": "MTA.Intimidation",
    "persuasion": "MTA.Persuasion",
    "socialize": "MTA.Socialize", 
    "streetwise": "MTA.Streetwise",
    "subterfuge": "MTA.Subterfuge"
  };
MTA.skills_mental = {
    "academics": "MTA.Academics",
    "computer": "MTA.Computer",
    "crafts": "MTA.Crafts",
    "investigation": "MTA.Investigation",
    "medicine": "MTA.Medicine",
    "occult": "MTA.Occult", 
    "politics": "MTA.Politics",
    "science": "MTA.Science"
  };

/**
 * The set of Derived Traits used within the system.
 * Do not modify.
 * @type {Object}
 */
MTA.derivedTraits = {
  "size": "MTA.Size",
  "speed": "MTA.Speed",
  "defense": "MTA.Defense",
  "armor": "MTA.Armor",
  "initiativeMod": "MTA.Initiative",
  "ballistic": "MTA.BallisticArmor",
  "perception": "MTA.Perception",
  "health": "MTA.Health"
}


/**
 * The set of Derived Dream Traits used within the system.
 * Do not modify.
 * @type {Object}
 */

MTA.attributes_physical_dream = {
  "power": "MTA.EphPower"
};

MTA.attributes_social_dream = {
  "finesse": "MTA.EphFinesse"
};

MTA.attributes_mental_dream = {
  "resistance": "MTA.EphResistance"
};


/**
 * The list of firearm ammunition.
 * Can freely be modified.
 * @type {Array[]}
 */
MTA.cartridges = ["9mm", ".38 Special", ".44 Magnum", ".45 ACP", "30.06", "5.56mm", "12-gauge", "Arrow", "Bolt", "Fuel Canister"];

/**
 * The list of relationship impressions.
 * Can freely be modified.
 * @type {Array[]}
 */
MTA.impressions = ["Hostile","Average","Good","Excellent","Perfect"];

/**
 * A list of item types that only normal characters use, to make sure that other characters can't use them.
 */
MTA.characterItemTypes = [
  "spell", "merit", "activeSpell", "attainment", "relationship", "rite", "vinculum", "discipline_power", "form", "embed", "exploit", "pact", "formAbility", "coil", "scale"
]

/**
 * The set of colours used as the border around portraits in the 
 * actor directory, when the user is the GM, or the character type
 * is set to visible on the character sheet.
 * @type {Object}
 */
MTA.typeColors = {
  unknown: "DimGray", 
  Mortal: "White", 
  Sleepwalker: "CadetBlue", 
  Proximi: "Aquamarine", 
  Mage: "Aqua", 
  Scelesti: "Purple",
  Ghost: "BurlyWood", 
  Spirit: "MediumPurple", 
  Angel: "Gold", 
  Demon: "Orangered", 
  Vampire: "Crimson", 
  Changeling: "DarkGreen", 
  Werewolf: "saddlebrown",
  Hunter: "slategray "
};


MTA.magicItemColors = {
  Default: 'MediumPurple',
  Awakened: 'Aqua',
  Gadget: 'Gold',
  Imbued: 'Aqua',
  Enhanced: 'Coral',
  Artifact: 'darkorange',
  Embedded: 'Gold',
  Exploited: 'Orangered'
}





/**
 * The list of supported melee weapon types.
 * Values added here will fall back to using Strength + Weaponry as
 * the associated dice pool for rolling.
 * @type {Array[]}
 */
MTA.meleeTypes = ["Melee", "Unarmed", "Thrown"];


/**
 * List of merits with special functions in order to display tooltips.
 * Don't modify.
 */
MTA.SPECIAL_MERITS = [
  {name: "Defensive Combat (Brawl)", tooltip: "Uses Brawl to calculate Defense"},
  {name: "Defensive Combat (Weaponry)", tooltip: "Uses Weaponry to calculate Defense (only if a weapon is equipped)"},
  {name: "Iron Stamina", tooltip: "Reduces wound penalty by rating"}
];

/* -------------------------------------------- */
/*          Vampire the Requiem                 */
/* -------------------------------------------- */

MTA.bloodPotency_levels = [
    {vitae_per_turn: 1, max_vitae: undefined},
    {vitae_per_turn: 1, max_vitae: 10},
    {vitae_per_turn: 2, max_vitae: 11},
    {vitae_per_turn: 3, max_vitae: 12},
    {vitae_per_turn: 4, max_vitae: 13},
    {vitae_per_turn: 5, max_vitae: 15},
    {vitae_per_turn: 6, max_vitae: 20},
    {vitae_per_turn: 7, max_vitae: 25},
    {vitae_per_turn: 8, max_vitae: 30},
    {vitae_per_turn: 10, max_vitae: 50},
    {vitae_per_turn: 15, max_vitae: 75}
  ];
MTA.actionTypes = ["Instant", "Reflexive", "Contested vs", "Contested (refl. resist.) vs", "Extended"];
MTA.rite_types = ["Rite", "Miracle"];
MTA.rite_withstandTypes = ["Resisted by", "Contested by"];


/**
 * The set of Vampire disciplines.
 * The separation into common and unique is purely for display purposes (and not even correct).
 * Can freely be modified.
 * @type {Object}
 */
MTA.disciplines_common = {
  "celerity": "MTA.DisciplineCelerity", // Adds to defense
  "resilience": "MTA.DisciplineResilience",
  "vigor": "MTA.DisciplineVigor",
  "animalism": "MTA.DisciplineAnimalism",
  "obfuscate": "MTA.DisciplineObfuscate",
  "cruac": "MTA.DisciplineCruac"
};

MTA.disciplines_unique = {
  "auspex": "MTA.DisciplineAuspex",
  "dominate": "MTA.DisciplineDominate",
  "majesty": "MTA.DisciplineMajesty",
  "nightmare": "MTA.DisciplineNightmare",
  "protean": "MTA.DisciplineProtean",
  "thebanSorcery": "MTA.DisciplineThebanSorcery"
};

/**
 * The set of rollable Vampire traits used within the system.
 * Do not modify.
 * @type {Object}
 */
 MTA.vampire_traits = {
  "bloodPotency": "MTA.BloodPotency",
  "humanity": "MTA.Humanity"
}